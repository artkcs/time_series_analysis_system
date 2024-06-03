from django.apps import AppConfig
import paho.mqtt.client as mqtt
from threading import Lock
import threading
import time

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import paho.mqtt.client as mqtt
        from threading import Lock
        from .models import Integration
        from .requests_scripts import fetch_csv_and_convert_to_json
        from .create_integration_table import insert_into_table
        from .utils import parse_message
        from django.db.utils import ProgrammingError
        import api.signals  # Ensure the signals are registered and mqtt_clients dictionary is accessible

        try:
            # Initialize MQTT clients for existing integrations
            integrations_mqtt = Integration.objects.filter(type=2).all()

            for integration in integrations_mqtt:
                print(f"Setting up integration: {integration.name}")
                self.setup_integration(integration, fetch_csv_and_convert_to_json, insert_into_table, parse_message, api.signals)

            print("MQTT setup complete")
            
            from .tasks import schedule_updates
            def start_periodic_updates():
                integrations_http = Integration.objects.filter(type=1).all()
                while True:
                    schedule_updates(integrations_http)
                    time.sleep(1800)  # Sleep for 1 hour (3600 seconds) between checks

            update_thread = threading.Thread(target=start_periodic_updates)
            update_thread.daemon = True
            update_thread.start()
        except ProgrammingError as e:
            print("MQTT initializing error: " + str(e))

    def setup_integration(self, integration, fetch_csv_and_convert_to_json, insert_into_table, parse_message, signals):
        lock = Lock()  # Define a lock specific to this integration

        client = mqtt.Client()

        def on_connect(client, userdata, flags, rc):
            print(f"Connected with result code {rc} to topic {integration.mqtt_topic}")
            client.subscribe(integration.mqtt_topic)

        def on_message(client, userdata, msg):
            from django.db.utils import IntegrityError
            with lock:
                print(f"Received message for integration {integration.name}")
                msg_str = msg.payload.decode("utf-8")

                msg_json = parse_message(msg_str, integration.data_type, fetch_csv_and_convert_to_json)

                try:
                    if isinstance(msg_json, list):
                        for row in msg_json:
                            insert_into_table(integration, row)
                    else:
                        insert_into_table(integration, msg_json)
                except IntegrityError as e:
                    print(f"Error inserting into table: {e}")

                print(f"Processed message: {msg_json}")

        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(integration.mqtt_broker, int(integration.mqtt_port), 60)
        client.loop_start()

        # Add the client to the mqtt_clients dictionary for dynamic management
        signals.mqtt_clients[integration.id] = client
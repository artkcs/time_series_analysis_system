import paho.mqtt.client as mqtt
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Integration
from threading import Lock
from .requests_scripts import fetch_csv_and_convert_to_json
from .create_integration_table import insert_into_table
from .utils import parse_message
from django.db.utils import IntegrityError

# Dictionary to keep track of active MQTT clients
mqtt_clients = {}

@receiver(post_save, sender=Integration)
def handle_integration_save(sender, instance, created, **kwargs):
    if instance.type == 2:
        # Remove existing client if it's being updated
        if instance.id in mqtt_clients:
            client = mqtt_clients[instance.id]
            client.loop_stop()
            client.disconnect()
        
        # Set up a new MQTT client
        lock = Lock()

        client = mqtt.Client()

        def on_connect(client, userdata, flags, rc):
            print(f"Connected with result code {rc} to topic {instance.mqtt_topic}")
            client.subscribe(instance.mqtt_topic)

        def on_message(client, userdata, msg):
            with lock:
                print(f"Received message for integration {instance.name}")
                msg_str = msg.payload.decode("utf-8")
                msg_json = parse_message(msg_str, instance.data_type, fetch_csv_and_convert_to_json)

                try:
                    if isinstance(msg_json, list):
                        for row in msg_json:
                            insert_into_table(instance, row)
                    else:
                        insert_into_table(instance, msg_json)
                except IntegrityError as e:
                    print(f"Error inserting into table: {e}")

                print(f"Processed message: {msg_json}")

        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(instance.mqtt_broker, int(instance.mqtt_port), 60)
        client.loop_start()

        mqtt_clients[instance.id] = client

@receiver(post_delete, sender=Integration)
def handle_integration_delete(sender, instance, **kwargs):
    if instance.type == 2:
        if instance.id in mqtt_clients:
            client = mqtt_clients.pop(instance.id)
            client.loop_stop()
            client.disconnect()
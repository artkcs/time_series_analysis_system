import requests
from django.utils import timezone
from datetime import timedelta
from .create_integration_table import insert_into_table
from .requests_scripts import fetch_csv_and_convert_to_json
import json


def update_integration(integration):
    try:
        response = requests.get(integration.http_url)
        if integration.data_type == 1:  # JSON format
            steps = integration.json_path.split("/")
            for step in steps:
                response_text = (json.loads(response.text))[step]    
        elif integration.data_type == 2:  # CSV format
            response_text = fetch_csv_and_convert_to_json(response.text)
        
        if isinstance(response_text, list):
            for row in response_text:
                insert_into_table(integration, row)
        else:
            insert_into_table(integration, response_text)
        
        integration.last_updated = timezone.now()
        integration.save()
    except Exception as e:
        print(f"Error updating integration {integration.name}: {e}")

def schedule_updates(integrations):
    now = timezone.now()
    print("Automatic HTTP integrations update started at: " + str(now))
    for integration in integrations:
        last_updated = timezone.datetime(2000,1,1,0,0,0).astimezone()
        if (integration.last_updated is not None):
            last_updated = integration.last_updated
            
        next_update_time = last_updated + timedelta(seconds=integration.periodicity * 3600)
        if now >= next_update_time:
            update_integration(integration)
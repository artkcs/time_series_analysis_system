from rest_framework import serializers
from .models import Integration

class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = ('name', 'http_url', 'id', 'owner', 'periodicity', 'dateformat', 'json_path', 'type', 'mqtt_broker', 'mqtt_topic', 'mqtt_port', 'data_type')
        
class AddIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = ('name', 'http_url', 'periodicity', 'dateformat', 'json_path', 'mqtt_broker', 'mqtt_port', 'data_type')
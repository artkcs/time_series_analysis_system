from django.db import models

# Create your models here.
    
class Integration(models.Model):
    name = models.CharField(max_length=50)
    http_url = models.CharField(max_length=400, null=True)
    type = models.IntegerField()
    data_type = models.IntegerField()
    mqtt_broker = models.CharField(max_length=400, null=True)
    mqtt_topic = models.CharField(max_length=400, null=True)
    mqtt_port = models.CharField(max_length=10, null=True)
    owner = models.CharField(max_length=200, default="system")
    periodicity = models.FloatField(default=0)
    dateformat = models.CharField(max_length=100, default="%Y-%m-%d %H:%M:%S")
    json_path = models.CharField(max_length=100, null=True)
    last_updated = models.DateTimeField(null=True)
    
    def __str__(self) -> str:
        return str(self.name)

class IntegrationFields(models.Model):
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE)
    field_name = models.CharField(max_length=100)
    integ_field_name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=100, null=True)
    
    
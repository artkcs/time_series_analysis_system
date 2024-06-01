from django.http import HttpResponse
from rest_framework import status
from .models import Integration, IntegrationFields
from .serializers import IntegrationSerializer, AddIntegrationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .create_integration_table import create_table, insert_into_table, delete_from_integration_table
from .select_integration_data import select_rows_by_date, select_rows_last_n
import requests
import json
from django.views.decorators.csrf import csrf_exempt
from .requests_scripts import *


# Create your views here
def main(request):
    return HttpResponse("<h1>Hello</h1>")

class GetIntegration(APIView):
    serializer_class = IntegrationSerializer
    lookup_url_kwarg = "id"
    
    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id != None:
            integration = Integration.objects.filter(id=id)
            if len(integration) > 0:
                data = IntegrationSerializer(integration[0]).data
                data['is_owner'] = self.request.session.session_key == integration[0].owner
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Integration Not Found': 'Invalid Integration id'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"Bad Request": "Id parameter not found in request"}, status=status.HTTP_400_BAD_REQUEST)
    
class GetIntegrationFields(APIView):
    lookup_url_kwarg = "id"
    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id != None:
            integration = Integration.objects.filter(id=id).first()
            fields_to_return = []
            fields = integration.integrationfields_set.all().order_by("field_name").values()
            for field in fields:
                fields_to_return.append({"field_name": field["field_name"], "integ_field_name": field["integ_field_name"], "field_type": field["field_type"]})
            
            if len(fields_to_return) > 0:
                return Response({"fields": fields_to_return}, status=status.HTTP_200_OK)
            return Response({'Integration Not Found': 'Invalid Integration id'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"Bad Request": "Id parameter not found in request"}, status=status.HTTP_400_BAD_REQUEST)

class GetIntegrationInitialData(APIView):
    lookup_url_kwarg = "id"
    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id != None:
            integration = Integration.objects.filter(id=id).first()
            fields = integration.integrationfields_set.all().order_by("field_name").values()
            
            field_names = []
            for f in fields:
                if f["field_name"] != "date":
                    field_names.append(f["field_name"])
            
            data = select_rows_last_n(id, 10, fields)
            
            response_data_values = []
            
            for row in data:
                response_data_values.append({"date": row[0], "fields": row[1:]})
                
            response_data = {"field_names": field_names, "values": response_data_values}
            
            return Response(response_data, status=status.HTTP_200_OK)     
         
        return Response({"Bad Request": "Id parameter not found in request"}, status=status.HTTP_400_BAD_REQUEST)

class DeleteIntegration(APIView):
    @csrf_exempt
    def delete(self, request, id):
      integration_lookup = Integration.objects.filter(id=id)
      
      if len(integration_lookup) <= 0:
          return Response({'Integration Not Found': 'Invalid Integration id'}, status=status.HTTP_404_NOT_FOUND)
      else:
          integration = integration_lookup.first()
          integration.delete()
          delete_from_integration_table(id)
          return Response({"Success": "Successfully deleted integration"}, status=status.HTTP_200_OK)
          
          
               
     
class UpdateIntegrationDataFromInteg(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        id = request.data.get("id")
        integration = Integration.objects.filter(id=id).first()
        data_type = integration.data_type
        http_url = integration.http_url
        json_path = integration.json_path
        
        try:
            #trying to send a request
            response = requests.get(http_url)

            if response.status_code == 200:
                response_text = {}
                #JSON format
                if data_type == 1:
                    steps = json_path.split("/")
                    for step in steps:
                        response_text = (json.loads(response.text))[step]            
                #CSV format
                if data_type == 2:
                    response_text = fetch_csv_and_convert_to_json(response.text)
                
                #insert rows into integration table from response
                if type(response_text) is list:
                    for row in response_text:
                        insert_into_table(integration, row)
                else:
                    insert_into_table(integration, response_text)
                return Response(IntegrationSerializer(integration).data, status=status.HTTP_201_CREATED)
            else:
                response = {'error': 'External integration is not responding'}
                return Response(response, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                        
        except:
            response = {'error': 'Unable to handle integration'}
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


class GetIntegrationData(APIView):
    lookup_url_kwarg = "id"
    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        start_date = request.GET.get("date_from")
        end_date = request.GET.get("date_to")
        if id != None:
            integration = Integration.objects.filter(id=id).first()
            fields = integration.integrationfields_set.all().order_by("field_name").values()
            
            field_names = []
            for f in fields:
                if f["field_name"] != "date":
                    field_names.append(f["field_name"])
            
            data = select_rows_by_date(id, start_date, end_date, fields)
            
            response_data_values = []
            
            for row in data:
                response_data_values.append({"date": row[0], "fields": row[1:]})
                
            response_data = {"field_names": field_names, "values": response_data_values}
            return Response(response_data, status=status.HTTP_200_OK)      
        return Response({"Bad Request": "Id parameter not found in request"}, status=status.HTTP_400_BAD_REQUEST)
    
class Integrations(APIView):
    serializer_class = IntegrationSerializer
    
    def get(self, request, format=None):
        integrations = Integration.objects.all()
        response = []
        for integration in integrations:
            data = IntegrationSerializer(integration).data
            response.append(data)

        return Response(response, status=status.HTTP_200_OK)
            
    
class AddIntegration(APIView):
    serializer_class = AddIntegrationSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        name = request.data.get("name")
        integ_type = int(request.data.get("type"))
        data_type = int(request.data.get("data_type"))
        http_url = request.data.get("http_url")
        mqtt_broker = request.data.get("mqtt_broker")
        mqtt_topic = request.data.get("mqtt_topic")
        mqtt_port = request.data.get("mqtt_port")
        periodicity = request.data.get("periodicity")
        dateformat = request.data.get("dateformat")
        json_path = request.data.get("json_path")
        fields = request.data.get("integ_fields")
        owner = self.request.session.session_key
        queryset_name = Integration.objects.filter(name=name)
        
        #if such integration name exists
        if queryset_name.exists():
            response = {'error': 'Name already exists'}
            return Response(response)
        
        #if integration is new
        else:
            #HTTP integration
            if integ_type == 1:
                #trying to send sample request
                response = requests.get(http_url)
                    
                if response.status_code == 200:
                    try:
                        response_text = {}
                        #JSON format
                        if data_type == 1:
                            steps = json_path.split("/")
                            for step in steps:
                                response_text = (json.loads(response.text))[step]            
                        #CSV format
                        if data_type == 2:
                            response_text = fetch_csv_and_convert_to_json(response.text)
                            
                        integration = Integration(name=name, http_url=http_url, owner=owner, periodicity=periodicity, dateformat=dateformat, json_path=json_path, type=integ_type, data_type=data_type)
                        integration.save()
                        
                        #date field row insert
                        integration_fields = IntegrationFields(integration=integration,
                                                            field_name="date",
                                                            integ_field_name=request.data.get("integ_date_field"),
                                                            field_type="date")
                        integration_fields.save()
                        
                        #mapped current system -> integration fields insert
                        for field in fields:
                            integration_fields = IntegrationFields(integration=integration, 
                                                                    field_name=field["field_name"], 
                                                                    integ_field_name=field["field_integ_name"],
                                                                    field_type=field["field_integ_type"])
                            
                            integration_fields.save()
                        create_table(integration.id, fields)
                        
                        #insert rows into new integration table from response
                        if type(response_text) is list:
                            for row in response_text:
                                insert_into_table(integration, row)
                        else:
                            insert_into_table(integration, response_text)
                        return Response(IntegrationSerializer(integration).data, status=status.HTTP_201_CREATED)
                    except:
                        return Response({"error": "Unable to handle integration"})
                else:
                    return Response({"error": "Unable to handle integration"})
                
            #MQTT integration
            elif integ_type == 2:
                try:
                    integration = Integration(name=name, mqtt_broker=mqtt_broker, mqtt_port=mqtt_port, mqtt_topic=mqtt_topic, owner=owner, dateformat=dateformat, json_path=json_path, type=integ_type, data_type=data_type)
                    integration.save()
                    
                    
                    #date field row insert
                    integration_fields = IntegrationFields(integration=integration,
                                                        field_name="date",
                                                        integ_field_name=request.data.get("integ_date_field"),
                                                        field_type="date")
                    integration_fields.save()
                    
                    for field in fields:
                        integration_fields = IntegrationFields(integration=integration, 
                                                                field_name=field["field_name"], 
                                                                integ_field_name=field["field_integ_name"],
                                                                field_type=field["field_integ_type"])
                        
                        integration_fields.save()
                    
                    create_table(integration.id, fields)
                    return Response(IntegrationSerializer(integration).data, status=status.HTTP_201_CREATED)
                except:
                    response = {'error': 'Unable to handle integration'}
                    return Response(response)     
        return Response({"error": "Internal server error"})
                
    
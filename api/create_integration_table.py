from django.db import connection
from datetime import datetime

def create_table(integration_id, fields):
    cursor = connection.cursor()
    request_str = "CREATE TABLE integration_for_" + str(integration_id) + "(date timestamp unique"
    
    for field in fields:
        request_str += ", "
        field_str = field["field_name"]
        
        field_type = "varchar(255)"
        match field["field_integ_type"]:
            case "text":
                field_type = "varchar(255)"
            case "number":
                field_type = "float(10)"
            case "date":
                field_type = "timestamp"
                
        request_str += field_str + " " + field_type
    request_str += ")"
    
    cursor.execute(request_str)
    
def insert_into_table(integration, row):
    cursor = connection.cursor()
    integration_id = integration.id
    dateformat = integration.dateformat
    converted_row = convert_field_names_from_integration(integration, row)
    date = datetime.strptime(converted_row["date"], dateformat)
    rows = select_rows_by_greater_than_date(integration_id, date)
    integration_fields = integration.integrationfields_set.all().order_by("field_name").values()
    
    #insert if entry with such date does not exist yet
    if len(rows) <= 0:
        sql = "INSERT INTO integration_for_" + str(integration_id) + " ("
        
        firstEntry = True
        for field in integration_fields:
            field_name = field["field_name"]
            sql_add = ""
            if not firstEntry:
                sql_add += ", "
            sql_add += field_name
            sql += sql_add
            
            firstEntry = False
        
        sql_add_values = ") VALUES ("
        sql += sql_add_values
        
        firstEntry = True
        for field in integration_fields:
            field_value = converted_row[field["field_name"]]
            sql_add = ""
            if not firstEntry:
                sql_add += ", "
            if field["field_type"] == "text" or field["field_type"] == "date":
                field_value = "'" + converted_row[field["field_name"]] + "'"
            sql_add += str(field_value)
            sql += sql_add
            
            firstEntry = False
        
        sql += ")"
        cursor.execute(sql)
        
        
    
def select_rows_by_greater_than_date(integration_id, date):
    cursor = connection.cursor()
    sql = "SELECT * FROM integration_for_" + str(integration_id) + " WHERE date = '" + str(date) + "'"
    cursor.execute(sql)
    return cursor.fetchall()

def convert_field_names_from_integration(integration, row):
    integration_fields = integration.integrationfields_set.all().order_by("field_name").values()
    converted_row = {}
    for field in integration_fields:
        converted_row[field["field_name"]] = row[field["integ_field_name"]]
    return converted_row

def delete_from_integration_table(id):
    cursor = connection.cursor()
    sql = "DROP TABLE integration_for_" + str(id) + ";"
    cursor.execute(sql)
     
from django.db import connection

def select_rows_by_date(integration_id, date_from, date_to, fields):
    fields_str = "date"

    for field in fields:
        if field["field_name"] != "date":
            fields_str += ", " + field["field_name"]
    
    cursor = connection.cursor()
    sql = "SELECT " + fields_str + " FROM integration_for_" + str(integration_id)
    if date_from and date_from != "null":
        sql += " WHERE "
        sql += "date >= '" + str(date_from) + "'"
    if date_to and date_to != "null":
        if date_from and date_from != "null":
            sql += " AND "
        else:
            sql += " WHERE "
        sql += "date <= '" + str(date_to) + "'"
    sql += " ORDER BY date DESC;"

    cursor.execute(sql)
    return cursor.fetchall()

def select_rows_last_n(integration_id, n, fields):
    fields_str = "date"
    for field in fields:
        if field["field_name"] != "date":
            fields_str += ", " + field["field_name"]
    
    cursor = connection.cursor()
    sql = "SELECT " + fields_str + " FROM integration_for_" + str(integration_id) + " ORDER BY date DESC LIMIT " + str(n) + ";"
    
    cursor.execute(sql)
    return cursor.fetchall()
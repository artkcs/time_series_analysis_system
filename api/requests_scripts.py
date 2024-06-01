import requests
import csv
import json
from io import StringIO

def fetch_csv_and_convert_to_json(response_text):
    # Convert the CSV data to a list of dictionaries
    csv_data = response_text
    csv_file = StringIO(csv_data)
    csv_reader = csv.DictReader(csv_file)

    data = [row for row in csv_reader]

    return data
import json

def parse_message(msg_str, data_type, fetch_csv_and_convert_to_json):
    if data_type == 1:  # JSON format
        msg_json = json.loads(msg_str)
    elif data_type == 2:  # CSV format
        msg_json = fetch_csv_and_convert_to_json(msg_str)
    else:
        msg_json = {}
    return msg_json
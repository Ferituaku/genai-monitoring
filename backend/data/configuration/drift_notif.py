import json
import requests

# Check threshold
def check_drift(eval_table, drift_threshold, criteria_score):
    threshold=[]
    for i in range(len(eval_table)):
        criteria=criteria_score
        rel = (eval_table.loc[i, "relevance/v1/score"] / 3) * criteria[0]["relevancy"]
        acc = (eval_table.loc[i, "accuracy/v1/score"] / 3) * criteria[0]["accuracy"]
        comp = (eval_table.loc[i, "completeness/v1/score"] / 3) * criteria[0]["completeness"]
        clar = (eval_table.loc[i, "clarity/v1/score"] / 3) * criteria[0]["clarity"]
        coh = (eval_table.loc[i, "coherence/v1/score"] / 3) * criteria[0]["coherence"]
        app = (eval_table.loc[i, "appropriateness/v1/score"] / 3) * criteria[0]["appropriateness"]
        tim = (eval_table.loc[i, "time_score"] / 3) * criteria[0]["time"]
        cons = (eval_table.loc[i, "consistency/v1/score"] / 3) * criteria[0]["consistency"]

        total = (rel + acc + comp + clar + coh + app + tim + cons)/100
        threshold.append(total)
    print("Threshold list:", threshold)

    data_message=[]
    data_threshold=[]
    for i in range(len(threshold)):
        if threshold[i]<drift_threshold:
            for j in range(len(eval_table)):
                if i==j:
                    message=eval_table.loc[j, "inputs"]
                    data_threshold.append(threshold[i])
                    data_message.append(message)
    return data_threshold, data_message, threshold

# Define mention payloads
def mention_who(email):
    name = email.split('@')[0].replace('.', ' ').title()  
    return {
        "type": "mention",
        "text": f"<at>{name}</at>",
        "mentioned": {
            "id": email,
            "name": name
        }
    }

def construct_message(data_threshold, data_message):
    # Constructing table rows with cells for each feature's attributes
    table_rows = []
    # Header row (for column titles)
    table_rows.append({
        "type": "TableRow",
        "cells": [
            {
                "type": "TableCell",
                "items": [
                    {"type": "TextBlock", "text": "Quetion", "weight": "bolder", "color" : "accent"}
                ]
            },
            {
                "type": "TableCell",
                "items": [
                    {"type": "TextBlock", "text": "Threshold Score", "weight": "bolder", "color" : "accent"}
                ]
            },
            {
                "type": "TableCell",
                "items": [
                    {"type": "TextBlock", "text": "Info", "weight": "bolder", "color" : "accent"}
                ]
            }
        ]
    })
    # Data rows for each feature
    for threshold, message in zip(data_threshold, data_message):
        # Create a row for each feature's data
        table_rows.append({
            "type": "TableRow",
            "cells": [
                {
                    "type": "TableCell",
                    "items": [
                        {"type": "TextBlock", "text": message}
                    ]
                },
                {
                    "type": "TableCell",
                    "items": [
                        {"type": "TextBlock", "text": str(threshold)}
                    ]
                },
                {
                    "type": "TableCell",
                    "items": [
                        {"type": "TextBlock", "text": "Tidak sesuai"}
                    ]
                }
            ]
        })
    return table_rows

# Construct the body of the message with the correct mention format
def construct_message_body(list_mention):
    return ' '.join(f'<at>{email.split("@")[0].replace(".", " ").title()}</at>' for email in list_mention)

# Function to send the Teams message
def send_teams_message(webhook_url, payload):
    headers = {
            'Content-Type': 'application/json'
    }
    try:
        response = requests.post(webhook_url, headers=headers, data=payload)
        response.raise_for_status()
        print("Message sent successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error sending message: {e}")

# Create Payload
def create_payload(list_mention, data_message, data_threshold, project_name):
    # Prepare payload for the Teams message
    payload = json.dumps({
    "type": "message",
    "attachments": [
        {
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": {
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "TextBlock",
                        "size": "ExtraLarge",
                        "weight": "Bolder",
                        "color": "Attention",
                        "text": "Threshold Alert!"
                    },
                    {
                        "type": "TextBlock",
                        "size": "Large",
                        "text": f"Detected Threshold!"
                    },
                    {
                        "type": "FactSet",
                        "facts": [
                            {
                                "title": "Project",
                                "value": f"{project_name}"
                            }
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "text": f"This is a test message with mentions.\n{construct_message_body(list_mention)}"
                    },
                    {
                        "type": "Table",
                        "columns": [
                            {"width": 'full'},
                            {"width": 'full'},
                            {"width": 'full'}
                        ],
                        "rows": construct_message(data_threshold, data_message)  # Insert table rows here
                    }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.6",
                "msteams": {
                    "width": "Full",
                    "entities": [mention_who(email) for email in list_mention]
                }
            }
        }
    ]
    })
    return payload


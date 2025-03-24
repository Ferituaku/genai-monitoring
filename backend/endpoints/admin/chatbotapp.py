from flask import jsonify, request,send_file
from flask_restful import Resource
from data.configuration.databaseopenlit import client
from datetime import datetime, timedelta, timezone

class ProjectChatService(Resource):

    def get(self):
        try:
            params = request.args.to_dict(flat=False)  
            from_date = request.args.get('from')
            to_date = request.args.get('to')

            from_zone = timezone.utc
            to_zone = timezone(timedelta(hours=7))

            try:
                if from_date and to_date:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00')).astimezone(to_zone)
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00')).astimezone(to_zone)
                else:
                    end_date = datetime.now(from_zone).astimezone(to_zone)
                    start_date = end_date - timedelta(days=1)
            except ValueError:
                return {"message": "Invalid date format. Use ISO 8601 format."}, 400

            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

            query = f'''
            SELECT 
                ServiceName,
                ResourceAttributes,
                SpanAttributes,
                Timestamp
            FROM openlit.otel_traces
            WHERE ServiceName IS NOT NULL 
                AND ResourceAttributes['deployment.environment'] IS NOT NULL
                AND SpanAttributes['UniqueIDChat'] IS NOT NULL
                AND SpanAttributes['UniqueIDChat'] != ''
                AND Timestamp BETWEEN '{start_date_str}' AND '{end_date_str}'
            '''
            
            rows = client.query(query).result_rows
            sessions = {}

            for row in rows:
                unique_id = row[2]['UniqueIDChat']
                chat_id = row[2].get('ChatID')
                timestamp = row[3].replace(tzinfo=from_zone).astimezone(to_zone)
                service_name = row[0]
                environment = row[1]['deployment.environment']
                
                session_key = f"{unique_id}-{service_name}-{environment}"

                if session_key not in sessions:
                    sessions[session_key] = {
                        'ServiceName': service_name,
                        'Environment': environment,
                        'UniqueIDChat': unique_id,
                        'Timestamp': timestamp,
                        'TotalMessages': set()
                    }
                else:
                    if timestamp < sessions[session_key]['Timestamp']:
                        sessions[session_key]['Timestamp'] = timestamp

                if chat_id:
                    sessions[session_key]['TotalMessages'].add(chat_id)

            result = []
            for session in sessions.values():
                result.append({
                    'ServiceName': session['ServiceName'],
                    'Environment': session['Environment'],
                    'UniqueIDChat': session['UniqueIDChat'],
                    'Timestamp': session['Timestamp'].isoformat(),
                    'TotalMessages': len(session['TotalMessages'])
                })

            result = sorted(result, key=lambda x: x['Timestamp'], reverse=True)

            projects = {}
            for row in result:
                service_name = row['ServiceName']
                environment = row['Environment']
                unique_id_chat = row['UniqueIDChat']
                timestamp = row['Timestamp']
                total_messages = row['TotalMessages']
                project_key = f"{service_name}-{environment}"

                if project_key not in projects:
                    projects[project_key] = {
                        "serviceName": service_name,
                        "environment": environment,
                        "totalRequests": 0,
                        "chatSessions": []
                    }
                
                if unique_id_chat and unique_id_chat.strip():
                    chat_session = {
                        "UniqueIDChat": unique_id_chat,
                        "Timestamp": timestamp,
                        "TotalMessages": total_messages,
                    }
                    
                    projects[project_key]["chatSessions"].append(chat_session)
                    projects[project_key]["totalRequests"] += 1

            return jsonify(list(projects.values()))

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return jsonify({"error":str(e)}),500

class ChatHistoryService(Resource):
    def get(self, unique_id_chat):
        try:
            export_format = request.args.get('export')

            if not unique_id_chat:
                return jsonify({"error": "UniqueIDChat parameter is required"}), 400

            service_query = f'''
                SELECT DISTINCT
                    ServiceName,
                    ResourceAttributes['deployment.environment'] AS Environment
                FROM openlit.otel_traces
                WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
                LIMIT 1
            '''
            
            service_info = client.query(service_query).result_rows
            
            if not service_info:
                return jsonify({"error": "Chat session not found"}), 404
            
            service_name, environment = service_info[0]

            history_query = f'''
                SELECT 
                    Timestamp AS Tanggal,
                    SpanAttributes['ChatID'] AS ChatID,
                    SpanAttributes['Prompt'] AS Pertanyaan,
                    SpanAttributes['Answer'] AS Jawaban
                FROM openlit.otel_traces
                WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
                    AND ServiceName = '{service_name}'
                    AND ResourceAttributes['deployment.environment'] = '{environment}'
                ORDER BY Timestamp ASC
            '''

            chat_history = client.query(history_query).result_rows
            total_messages = len(chat_history)

            from_zone = timezone.utc
            to_zone = timezone(timedelta(hours=7))

            formatted_history = [
                {
                    "Timestamp": row[0].replace(tzinfo=from_zone).astimezone(to_zone).isoformat(),
                    "ChatID": row[1],
                    "Pertanyaan": row[2],
                    "Jawaban": row[3]
                }
                for row in chat_history
            ]


            # **3. Jika tidak ada parameter ekspor, kembalikan JSON biasa**
            response_data = {
                "UniqueIDChat": unique_id_chat,
                "ServiceName": service_name,
                "Environment": environment,
                "TotalMessages": total_messages,
                "ChatHistory": formatted_history
            }
            return jsonify(response_data)

        except Exception as e:
            return jsonify({"error": str(e)}), 500
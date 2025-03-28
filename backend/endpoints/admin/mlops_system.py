import os
import requests
from requests.auth import HTTPBasicAuth
import pandas as pd
import datetime, time
from datetime import timedelta
import sys, threading, json
from dotenv import load_dotenv
import mlflow
import openai
from flask import request
from flask_restful import Resource
from endpoints.admin.evaluation import insert_record, update_record
from data.configuration.mlflow_metric import all_metric
from data.configuration.drift_notif import check_drift, create_payload, send_teams_message
from data.configuration.config import evaluation
import uuid

load_dotenv()

class UploadDataMlops(Resource):
    def read_data(self, data):
        eval_df = pd.DataFrame(data)
        print(eval_df)
        return eval_df

    # get chatbot answer
    def fetch_chatbot_answer(self, chatbot_email, prompt, chat_api_url, auth_username, auth_password, auth, scope):
        max_retries = 3
        retry_delay = 60
        payload = {
            "email": chatbot_email,
            "prompt": prompt,
            "stream": False
        }
        
        headers = {"Content-Type": "application/json"} 
        for attempt in range(max_retries):
            try:
                if auth is not None:  
                    headers["Authorization"] = auth  
                    auth_param = None  
                else:
                    auth_param = HTTPBasicAuth(auth_username, auth_password)  
                    
                response = requests.post(
                    chat_api_url,
                    json=payload,
                    auth=auth_param,
                    headers=headers
                )
                response.raise_for_status()
                
                output = response.json().get("output", "")
                response_time = response.json().get("responseTime", "")
                token_consumed = response.json().get("tokenComsumed", "")
                time.sleep(5)
                return output, response_time, token_consumed
                break
            except requests.exceptions.RequestException as e:
                print("Connection to chatbot error")
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    print("Max retries reached. Exiting.")
                    sys.exit(1)

    # Get consistency metric
    def for_consistency(self, eval_df, chatbot_email, chat_api_url, auth_username, auth_password, auth, scope, consistency_metric):
        if "outputForConsistency" not in eval_df.columns:
            eval_df["outputForConsistency"] = ""

        total_token = 0

        print("Run chatbot")
        for idx, row in eval_df.iterrows():
            all_output = [row["outputs"]]
            for _ in range(2):
                output, response_time, token = self.fetch_chatbot_answer(chatbot_email, row["inputs"], chat_api_url, auth_username, auth_password, auth, scope)
                all_output.append(output)
                total_token += token

            joined_output = "\n".join([f"Answer {i + 1}: {text}" for i, text in enumerate(all_output)])
            eval_df.at[idx, "outputForConsistency"] = joined_output

        run_name = f"metric(4)-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}"
        with mlflow.start_run(run_name=run_name) as run:
            results = mlflow.evaluate(
                data=eval_df,
                model_type="question-answering",
                evaluators="default",
                predictions="outputForConsistency",
                extra_metrics=[consistency_metric],
            )
            eval_table = results.tables["eval_results_table"]
            eval_table["total_token_consumed"] = total_token

        print("Metrics 4 done!")
        print("Ini total token:", total_token)
        return total_token, eval_table

    # Get all metric except consistency
    def final_evaluation(self, eval_df, chatbot_email, chat_api_url, auth_username, auth_password, auth, scope, relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric):
        if "outputs" not in eval_df.columns:
            eval_df["outputs"] = ""
        if "response_time" not in eval_df.columns:
            eval_df["response_time"] = ""
        if "token_consumed" not in eval_df.columns:
            eval_df["token_consumed"] = 0
        if "time_score" not in eval_df.columns:
            eval_df["time_score"] = 0
        if "time_justification" not in eval_df.columns:
            eval_df["time_justification"] = ""

        print("Run chatbot")
        for idx, row in eval_df.iterrows():
            input_text = row["inputs"]
            output, response_time, token_consumed = self.fetch_chatbot_answer(chatbot_email, input_text, chat_api_url, auth_username, auth_password, auth, scope)
            
            eval_df.at[idx, "outputs"] = output
            eval_df.at[idx, "response_time"] = pd.to_timedelta(response_time)
            eval_df.at[idx, "token_consumed"] = int(token_consumed)

            if eval_df.at[idx, "response_time"] <= timedelta(seconds=15):
                time_score = 3
                time_justification = "Response time ≤ 15 seconds."
            elif eval_df.at[idx, "response_time"] <= timedelta(seconds=45):
                time_score = 2
                time_justification = "Response time ≤ 45 seconds."
            else:
                time_score = 1
                time_justification = "Response time > 45 seconds."

            eval_df.at[idx, "time_score"] = time_score
            eval_df.at[idx, "time_justification"] = time_justification

        eval_df["response_time"] = eval_df["response_time"].astype(str).str.split().str[-1]

        run_name = f"metric(1)-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}"
        print(eval_df)
        with mlflow.start_run(run_name=run_name) as run:
            results = mlflow.evaluate(
                data=eval_df,
                model_type="question-answering",
                evaluators="default",
                predictions="outputs",
                extra_metrics=[
                    relevance_metric, accuracy_answer_metric
                ],
            )
            eval_table_1 = results.tables["eval_results_table"]
        print("Metrics 1 done!")
        time.sleep(10)

        run_name = f"metric(2)-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}"
        with mlflow.start_run(run_name=run_name) as run:
            results = mlflow.evaluate(
                data=eval_df,
                model_type="question-answering",
                evaluators="default",
                predictions="outputs",
                extra_metrics=[
                    completeness_metric,clarity_metric
                ],
            )
            eval_table_2 = results.tables["eval_results_table"]
        print("Metrics 2 done!")
        time.sleep(10)

        run_name = f"metric(3)-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}"
        with mlflow.start_run(run_name=run_name) as run:
            results = mlflow.evaluate(
                data=eval_df,
                model_type="question-answering",
                evaluators="default",
                predictions="outputs",
                extra_metrics=[
                    coherence_metric, appropriateness_metric
                ],
            )
            eval_table_3 = results.tables["eval_results_table"]
        print("Metrics 3 done!")
        time.sleep(10)

        eval_table = eval_table_1.merge(eval_table_2[["completeness/v1/score"]], left_index=True, right_index=True, how="left")
        eval_table = eval_table.merge(eval_table_2[["clarity/v1/score"]], left_index=True, right_index=True, how="left")
        eval_table = eval_table.merge(eval_table_3[["coherence/v1/score"]], left_index=True, right_index=True, how="left")
        eval_table = eval_table.merge(eval_table_3[["appropriateness/v1/score"]], left_index=True, right_index=True, how="left")

        return eval_table, eval_df, eval_table_1,eval_table_2, eval_table_3

    def bg_process_mlops(self, chatbot_email, chat_api_url, auth_username, auth_password, auth, drift_threshold, scope, data, relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric, consistency_metric, criteria_score, json_filename):
        # Make id first
        session_id = str(uuid.uuid4())
        create_at = datetime.datetime.now()

        initial_data = {
            "status": "processing",
            "start_time": create_at.isoformat(),
        }

        insert_record(
            session_id,
            scope,
            f"{json_filename}",
            initial_data,
            create_at,
            "processing"
        )
        print("Initial record added with processing status!")

        # Run evaluation
        eval_df=self.read_data(data)
        eval_table, eval_df_fix, eval_table_1,eval_table_2, eval_table_3 = self.final_evaluation(eval_df, chatbot_email, chat_api_url, auth_username, auth_password, auth, scope, relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric)
        consistensy_token, eval_table_cons=self.for_consistency(eval_df_fix, chatbot_email, chat_api_url, auth_username, auth_password, auth, scope, consistency_metric)

        # Find threshold
        eval_table = eval_table.merge(eval_table_cons[["consistency/v1/score"]], left_index=True, right_index=True, how="left")
        data_threshold, data_message, threshold=check_drift(eval_table, drift_threshold, criteria_score)
        print(data_threshold)

        # Final result
        df = pd.DataFrame({
            "Input": eval_table_1["inputs"].values.flatten(),
            "Ground Truth": eval_table_1["ground_truth"].values.flatten(),
            "Output": eval_table_1["outputs"].values.flatten(),
            "Token Metrics": eval_table_1["token_count"].values.flatten(),
            "Token Chatbot": eval_table_1["token_consumed"].values.flatten(),
            "Relevancy Score": eval_table_1["relevance/v1/score"].values.flatten(),
            "Relevancy Description": eval_table_1["relevance/v1/justification"].values.flatten(),
            "Accuracy Score": eval_table_1["accuracy/v1/score"].values.flatten(),
            "Accuracy Description": eval_table_1["accuracy/v1/justification"].values.flatten(),
            "Completeness Score": eval_table_2["completeness/v1/score"].values.flatten(),
            "Completeness Description": eval_table_2["completeness/v1/justification"].values.flatten(),
            "Clarity Score": eval_table_2["clarity/v1/score"].values.flatten(),
            "Clarity Description": eval_table_2["clarity/v1/justification"].values.flatten(),
            "Coherence Score": eval_table_3["coherence/v1/score"].values.flatten(),
            "Coherence Description": eval_table_3["coherence/v1/justification"].values.flatten(),
            "Appropriateness Score": eval_table_3["appropriateness/v1/score"].values.flatten(),
            "Appropriateness Description": eval_table_3["appropriateness/v1/justification"].values.flatten(),
            "Time Score": eval_table_1["time_score"].values.flatten(),
            "Time Description": eval_table_1["time_justification"].values.flatten(),
            "Consistency Score": eval_table_cons["consistency/v1/score"].values.flatten(),
            "Consistency Description": eval_table_cons["consistency/v1/justification"].values.flatten(),
        })
        df["Threshold"] = threshold 
        json_data = df.to_json(orient="records", indent=4)
        json_dict = json.loads(json_data)
        time_now=datetime.datetime.now().strftime('%Y%m%d-%H%M')

        run_name = f"metric final-{json_filename}-{time_now}"
        with mlflow.start_run(run_name=run_name) as run:
            mlflow.log_dict(json_dict, f"{json_filename}")
        print("Final metric done!")

        # Update database
        complete_time = datetime.datetime.now()

        update_record(
            session_id,
            json_dict,
            "completed",
            complete_time
        )
        print("Record updated with complete results!")

        # Send to teams
        if data_threshold:
            payload = create_payload(evaluation.list_mention, data_message, data_threshold, scope)
            send_teams_message(evaluation.teams_webhook_url, payload)
                    
    def post(self):
        payload = json.loads(request.data.decode('utf-8'))
        #Get the question
        scope = payload['scope']
        drift_threshold = payload['drift_threshold']
        chat_api_url = payload['chat_api_url']
        chatbot_email = payload['chatbot_email']
        auth_username = payload['auth_username']
        auth_password = payload['auth_password']
        auth = payload['auth']
        data = payload['data']
        criteria_score = payload['criteria_score']
        open_api_key = payload['openai_api_key']
        open_api_base = payload['openai_api_base']
        open_api_version = payload['openai_api_version']
        open_api_type = payload['openai_api_type']
        openai_deployment_name = payload['openai_deployment_name']
        json_filename = payload['json_filename']

        os.environ["OPENAI_API_KEY"] = open_api_key
        os.environ["OPENAI_API_BASE"] = open_api_base
        os.environ["OPENAI_API_VERSION"] = open_api_version
        os.environ["OPENAI_API_TYPE"] = open_api_type
        os.environ["OPENAI_DEPLOYMENT_NAME"] = openai_deployment_name

        relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric, consistency_metric=all_metric()

        # MLFlow url
        os.environ["MLFLOW_TRACKING_USERNAME"] = evaluation.usrnm_mlflow
        os.environ["MLFLOW_TRACKING_PASSWORD"] = evaluation.pass_mlflow

        mlflow.set_tracking_uri(evaluation.url_mlflow)
        mlflow.set_experiment(f"{evaluation.projectname} - {scope}")
        
        mlops_thread = threading.Thread(target=self.bg_process_mlops, args=(chatbot_email, chat_api_url, auth_username, auth_password, auth, drift_threshold, scope, data, relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric, consistency_metric, criteria_score, json_filename))
        mlops_thread.start()

        return {"success": True, "message": "Evaluation is running in the background!"}

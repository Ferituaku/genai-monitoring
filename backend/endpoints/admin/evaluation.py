import os
import pandas as pd
import json
import sqlite3
import shutil
from flask import request, jsonify
from flask_restful import Resource
from data.configuration.config import evaluation
from data.configuration.db import Database

def insert_record(id, project, filename, json_data, create_at, status="processing", complete_time=None):
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    json_string = json.dumps(json_data)
    insert_record = "INSERT INTO mlops (id, project, filename, json_data, create_at, status, complete_time) VALUES (?, ?, ?, ?, ?, ?, ?)"
    cursor.execute(insert_record, (id, project, filename, json_string, create_at, status, complete_time))
    conn.commit()
    conn.close()

def update_record(id, json_data, status="completed", complete_time=None):
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    json_string = json.dumps(json_data)
    update_sql = "UPDATE mlops SET json_data = ?, status = ?, complete_time = ? WHERE id = ?"
    cursor.execute(update_sql, (json_string, status, complete_time, id))
    conn.commit()
    conn.close()

def get_all_data():
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    select_sql = "SELECT id, project, filename, json_data, create_at, status, complete_time FROM mlops"
    cursor.execute(select_sql)
    mlops_data = cursor.fetchall()
    conn.close()
    data = [
        {"id": mlops[0], "project": mlops[1], "file_name": mlops[2], "json_data": json.loads(mlops[3]), 
         "create_at": mlops[4], "status": mlops[5], "complete_time": mlops[6]} 
        for mlops in mlops_data
    ]
    return data

def delete_data(file_id):
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    delete_sql = 'DELETE FROM mlops WHERE id = ?'
    cursor.execute(delete_sql, (file_id,))
    conn.commit()
    conn.close()

def get_json_by_id(file_id):
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    select_sql = "SELECT json_data FROM mlops WHERE id = ?"
    cursor.execute(select_sql, (file_id,))
    mlops_data = cursor.fetchone() 
    conn.close()

    if mlops_data:
        try:
            return {"json_data": json.loads(mlops_data[0])} 
        except json.JSONDecodeError:
            return {"Info" : f"Warning: Gagal parsing JSON dari {file_id}"}
    return {"Info" : f"File {file_id} tidak ditemukan"}


class GetAllFile(Resource):
    def get(self):
        data = get_all_data()
        return jsonify(data)

class DeleteFileJson(Resource):
    def post(self):
        payload = json.loads(request.data.decode('utf-8'))
        if 'fileId' in payload:
            file_id = payload['fileId']
            delete_data(file_id)
            return {"message": f"Successfully deleted file with ID {file_id}!"}
        else:
            return {"error": "Missing required parameter: fileId"}, 400

class GetJsonById(Resource):
    def post(self):
        payload = json.loads(request.data.decode('utf-8'))
        if 'fileId' in payload:
            file_id = payload['fileId']
            data = get_json_by_id(file_id)
            return jsonify(data)
        else:
            return {"error": "Missing required parameter: fileId"}, 400
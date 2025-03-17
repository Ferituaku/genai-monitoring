from flask import jsonify, request, send_file
from flask_restful import Resource
from data.configuration.databaseopenlit import client
from data.configuration.db import db
from datetime import datetime
import sqlite3
from io import BytesIO
import os

class AppCatalogue(Resource):
    def get(self):
        try:
            app_catalogue_query = """
                SELECT 
                    ServiceName,
                    COUNT(*) AS TotalRequests,
                    min(Timestamp) AS FirstRequest,
                    max(Timestamp) AS LastRequest,
                    argMax(ResourceAttributes['deployment.environment'], Timestamp) AS Environment
                FROM openlit.otel_traces
                WHERE ServiceName IS NOT NULL
                GROUP BY ServiceName
                ORDER BY LastRequest DESC, FirstRequest DESC
            """
            
            try:
                app_catalogue = client.query(app_catalogue_query).result_rows
            except Exception as db_error:
                return jsonify([])

            if not app_catalogue:
                return jsonify([])

            app_catalogue_result = []
            for row in app_catalogue:
                project_name = row[0] if row[0] else ""
                
                # Check if project has a logo
                has_logo = False
                try:
                    if project_name:
                        logo_result = db.fetch_one(
                            "SELECT id FROM logos WHERE project_name = ?", 
                            (project_name,)
                        )
                        has_logo = logo_result is not None
                except Exception:
                    has_logo = False
                
                app_info = {
                    "ProjectName": project_name,
                    "JumlahRequest": row[1] if row[1] is not None else 0,
                    "CreatedAt": row[2] if row[2] is not None else "",
                    "LastUpdate": row[3] if row[3] is not None else "",
                    "Environment": row[4] if row[4] is not None else "",
                    "HasLogo": has_logo
                }
                app_catalogue_result.append(app_info)

            return jsonify(app_catalogue_result)
        
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500


class AppCatalogueLogo(Resource):
    def get(self, project_name=None):
        try:
            if project_name:
                # Get specific logo
                logo = db.fetch_one(
                    """SELECT logo_data, logo_filename, logo_mimetype 
                    FROM logos 
                    WHERE project_name = ?""",
                    (project_name,)
                )
                
                if not logo:
                    return {"error": f"Logo not found for {project_name}"}, 404
                
                if not logo["logo_data"]:
                    return {"error": "Logo data is empty or invalid"}, 404
                
                try:
                    # Send file to client
                    return send_file(
                        BytesIO(logo["logo_data"]),
                        mimetype=logo["logo_mimetype"] or "image/jpeg",
                        as_attachment=False,
                        download_name=logo["logo_filename"]
                    )
                except Exception as e:
                    return {"error": f"Error sending file: {str(e)}"}, 500
            else:
                # Get all logos (metadata only, no binary data)
                logos = db.fetch_all(
                    """SELECT id, project_name, logo_filename, created_at, updated_at 
                    FROM logos ORDER BY updated_at DESC"""
                )
                return jsonify(logos)
                
        except Exception as e:
            return {"error": f"Internal server error: {str(e)}"}, 500
    
    def post(self):
        try:
            if 'logo' not in request.files:
                return {"error": "No file in request"}, 400
                
            logo_file = request.files['logo']
            project_name = request.form.get('project_name')
            
            # Validate input
            if not project_name:
                return {"error": "Project name is required"}, 400
            
            if not logo_file or not logo_file.filename:
                return {"error": "Invalid logo file"}, 400
                
            # Reset file pointer and read data
            logo_file.seek(0)
            logo_data = logo_file.read()
            
            # Check if logo already exists
            existing_logo = db.fetch_one(
                "SELECT id FROM logos WHERE project_name = ?", 
                (project_name,)
            )
                
            if existing_logo:
                # Update existing logo
                db.execute_query(
                    """UPDATE logos 
                    SET logo_data = ?, logo_filename = ?, logo_mimetype = ?, updated_at = ?
                    WHERE project_name = ?""",
                    (sqlite3.Binary(logo_data), logo_file.filename, 
                    logo_file.mimetype, datetime.now(), project_name)
                )
            else:
                # Insert new logo
                db.execute_query(
                    """INSERT INTO logos 
                    (project_name, logo_data, logo_filename, logo_mimetype, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)""",
                    (project_name, sqlite3.Binary(logo_data), logo_file.filename, 
                    logo_file.mimetype, datetime.now(), datetime.now())
                )
            
            return {"message": "Logo saved successfully"}, 201
                
        except Exception as e:
            return {"error": str(e)}, 500

    def delete(self, project_name):
        try:
            # Check if logo exists
            existing_logo = db.fetch_one(
                "SELECT id FROM logos WHERE project_name = ?", 
                (project_name,)
            )
            
            if not existing_logo:
                return {"error": "Logo not found"}, 404
                
            # Delete the logo
            db.execute_query(
                "DELETE FROM logos WHERE project_name = ?",
                (project_name,)
            )
            
            return {"message": "Logo deleted successfully"}, 200
                
        except Exception as e:
            return {"error": str(e)}, 500
    
    def _is_valid_image(self, filename):
        allowed_extensions = {'.png', '.jpg', '.jpeg'}
        file_ext = os.path.splitext(filename.lower())[1]
        return file_ext in allowed_extensions
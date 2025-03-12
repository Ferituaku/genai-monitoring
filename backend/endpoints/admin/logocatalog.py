from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max upload

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simple in-memory database to store logo mappings
# In a real application, you would use a proper database
app_logos = {}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-logo', methods=['POST'])
def upload_logo():
    if 'logo' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['logo']
    app_id = request.form.get('appId')
    
    if not app_id:
        return jsonify({'error': 'Application ID is required'}), 400
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate a unique filename to prevent collisions
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{app_id}_{uuid.uuid4().hex}.{file_extension}"
        
        # Save the file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Store the mapping between app_id and logo filename
        app_logos[app_id] = unique_filename
        
        # Return the URL to access the logo
        logo_url = f"/api/logos/{unique_filename}"
        return jsonify({
            'success': True,
            'logoUrl': logo_url,
            'message': 'Logo uploaded successfully'
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/logos/<filename>')
def get_logo(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/app-logo/<app_id>')
def get_app_logo(app_id):
    if app_id in app_logos:
        filename = app_logos[app_id]
        return jsonify({
            'success': True,
            'logoUrl': f"/api/logos/{filename}"
        })
    return jsonify({'error': 'Logo not found for this application'}), 404

@app.route('/api/delete-logo/<app_id>', methods=['DELETE'])
def delete_logo(app_id):
    if app_id in app_logos:
        filename = app_logos[app_id]
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Delete the file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Remove the mapping
        del app_logos[app_id]
        
        return jsonify({
            'success': True,
            'message': 'Logo deleted successfully'
        })
    
    return jsonify({'error': 'Logo not found for this application'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5101)
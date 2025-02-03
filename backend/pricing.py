from flask import Flask, jsonify, request
import json
from flask_cors import CORS
import os

class PricingManager:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = self._load_data()

    def _load_data(self):
        """Load data from JSON file."""
        try:
            with open(self.file_path, 'r') as file:
                return json.load(file)
        except FileNotFoundError:
            print(f"Warning: File not found at {self.file_path}")
            return {}
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON format in {self.file_path}")
            return {}

    def save_data(self):
        """Save current data to JSON file."""
        try:
            with open(self.file_path, 'w') as file:
                json.dump(self.data, file, indent=4)
            return True
        except Exception as e:
            print(f"Error saving data: {str(e)}")
            return False

    def get_all_data(self):
        """Get all pricing data."""
        return self.data

    def get_model_data(self, model):
        """Get data for specific model."""
        return self.data.get(model)

    def add_model_data(self, model, new_data):
        """Add new data to a model."""
        if not isinstance(new_data, dict):
            return False, "Invalid data format"

        if model not in self.data:
            self.data[model] = {}

        # Check for duplicate keys
        for key in new_data:
            if key in self.data[model]:
                return False, f"Key '{key}' already exists"

        # Add new data
        self.data[model].update(new_data)
        return True, "Data added successfully"

    def update_model_data(self, model, data_model, new_value):
        """Update specific data in a model."""
        if model not in self.data or data_model not in self.data[model]:
            return False, "Model or data not found"

        self.data[model][data_model] = new_value
        return True, "Data updated successfully"

    def delete_model_data(self, model, data_model):
        """Delete specific data from a model."""
        if model not in self.data or data_model not in self.data[model]:
            return False, "Model or data not found"

        del self.data[model][data_model]
        return True, "Data deleted successfully"

class PricingAPI:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(base_path, '..', 'lib', 'llm', 'token', 'pricing.json')
        self.pricing_manager = PricingManager(json_path)
        self.app = Flask(__name__)

        CORS(self.app, resources={
            r"/data/*": {
                "origins": ["http://localhost:3000"],
                "methods": ["GET", "POST", "PUT", "DELETE"],
                "allow_headers": ["Content-Type"]
            }
        })
        self.setup_routes()

    def setup_routes(self):
        """Setup all API routes."""
        self.app.route('/data', methods=['GET'])(self.get_all_data)
        self.app.route('/data/<model>', methods=['GET'])(self.get_data_by_model)
        self.app.route('/data/<model>', methods=['POST'])(self.add_data_to_model)
        self.app.route('/data/<model>/<data_model>', methods=['PUT'])(self.update_data_model)
        self.app.route('/data/<model>/<data_model>', methods=['DELETE'])(self.delete_data_model)

    def get_all_data(self):
        """GET /data endpoint."""
        return jsonify(self.pricing_manager.get_all_data()), 200

    def get_data_by_model(self, model):
        """GET /data/<model> endpoint."""
        data = self.pricing_manager.get_model_data(model)
        if data is None:
            return jsonify({"error": "Model not found"}), 404
        return jsonify({model: data}), 200

    def add_data_to_model(self, model):
        """POST /data/<model> endpoint."""
        success, message = self.pricing_manager.add_model_data(model, request.json)
        if not success:
            return jsonify({"error": message}), 400

        if not self.pricing_manager.save_data():
            return jsonify({"error": "Failed to save data"}), 500

        return jsonify({
            "message": message,
            model: self.pricing_manager.get_model_data(model)
        }), 201

    def update_data_model(self, model, data_model):
        """PUT /data/<model>/<data_model> endpoint."""
        new_value = request.json.get("value")
        if new_value is None:
            return jsonify({"error": "Missing 'value' in request body"}), 400

        success, message = self.pricing_manager.update_model_data(model, data_model, new_value)
        if not success:
            return jsonify({"error": message}), 404

        if not self.pricing_manager.save_data():
            return jsonify({"error": "Failed to save data"}), 500

        return jsonify({
            "message": message,
            model: self.pricing_manager.get_model_data(model)
        }), 200

    def delete_data_model(self, model, data_model):
        """DELETE /data/<model>/<data_model> endpoint."""
        success, message = self.pricing_manager.delete_model_data(model, data_model)
        if not success:
            return jsonify({"error": message}), 404

        if not self.pricing_manager.save_data():
            return jsonify({"error": "Failed to save data"}), 500

        return jsonify({
            "message": message,
            model: self.pricing_manager.get_model_data(model)
        }), 200

    def run(self, debug=True, port=5000):
        """Run the Flask application."""
        self.app.run(debug=debug, port=port)

if __name__ == '__main__':
    api = PricingAPI()
    api.run(debug=True, port=5000)
from flask import Flask, jsonify, request
import json

app = Flask(__name__)

# Load JSON data from the file
with open('.\lib\llm\token\pricing.json', 'r') as file:
    data = json.load(file)

@app.route('/data', methods=['GET'])
def get_all_data():
    return jsonify(data)

@app.route('/data/<key>', methods=['GET'])
def get_data_by_key(key):
    if key in data:
        return jsonify({key: data[key]})
    return jsonify({"error": "Key not found"}), 404

@app.route('/data/<key>', methods=['POST'])
def add_data_to_key(key):
    if key not in data:
        return jsonify({"error": "Key not found"}), 404
    
    new_data = request.json
    if not isinstance(new_data, dict):
        return jsonify({"error": "Invalid data format, must be a JSON object"}), 400

    data[key].update(new_data)
    return jsonify({"message": "Data added successfully", key: data[key]})

@app.route('/data/<key>/<subkey>', methods=['PUT'])
def update_subkey_in_key(key, subkey):
    if key not in data or subkey not in data[key]:
        return jsonify({"error": "Key or subkey not found"}), 404

    new_value = request.json.get("value")
    if new_value is None:
        return jsonify({"error": "Missing 'value' in request body"}), 400

    data[key][subkey] = new_value
    return jsonify({"message": "Subkey updated successfully", key: data[key]})

@app.route('/data/<key>/<subkey>', methods=['DELETE'])
def delete_subkey_from_key(key, subkey):
    if key not in data or subkey not in data[key]:
        return jsonify({"error": "Key or subkey not found"}), 404

    del data[key][subkey]
    return jsonify({"message": "Subkey deleted successfully", key: data[key]})

if __name__ == '__main__':
    app.run(debug=True)
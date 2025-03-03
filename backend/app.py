from flask import Flask, request, jsonify
from flask_cors import CORS
from google_maps_service import search_charities, get_place_details

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get("query")
    location = data.get("location", "UK")  # Default to UK if no location specified

    print(f"Searching for: {query} in {location}")

    if not query:
        return jsonify({"error": "No search query provided"}), 400

    results = search_charities(query, location)
    print(f"Found {len(results)} results")

    return jsonify(results)

@app.route('/details', methods=['POST'])
def details():
    data = request.json
    place_id = data.get("place_id")

    print(f"Getting details for place_id: {place_id}")

    if not place_id:
        return jsonify({"error": "No place_id provided"}), 400

    result = get_place_details(place_id)
    print(f"Got details for: {result.get('name', 'Unknown')}")

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
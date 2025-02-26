from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import scrape_website

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.json
    url = data.get("url")

    print(f"Received URL: {url}")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    result = scrape_website(url)
    print(f"Scraped Data: {result}")

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

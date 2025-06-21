from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

@app.route('/')
def home():
    return "M3U8 API is running"

@app.route('/get_fresh_m3u8/<int:stream_id>')
def get_fresh_m3u8(stream_id):
    url = f'https://sportslivehub01.live/en-IN/stream/{stream_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch page'}), 500

    soup = BeautifulSoup(response.text, 'html.parser')
    
    scripts = soup.find_all('script')
    for script in scripts:
        if 'huibo.tv' in script.text and '.m3u8' in script.text:
            match = re.search(r'(https.*?\.m3u8\?[^\'"\s]+)', script.text)
            if match:
                return jsonify({'m3u8': match.group(1)})

    return jsonify({'error': 'M3U8 not found'}), 404

if __name__ == '__main__':
    app.run()

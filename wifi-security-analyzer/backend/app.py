from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from scanner import WifiScanner
from utils import analyze_risk, get_signal_label
import sqlite3
import os
import datetime
import speedtest

app = Flask(__name__, static_folder='../frontend/static', template_folder='../frontend/templates')
CORS(app)

# Initialize Database
DB_PATH = 'scan_history.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scans
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp TEXT, 
                  ssid TEXT, 
                  bssid TEXT, 
                  signal INTEGER, 
                  encryption TEXT, 
                  risk_level TEXT)''')
    conn.commit()
    conn.close()

init_db()

scanner = WifiScanner()

@app.route('/')
def index():
    return send_from_directory('../frontend/templates', 'index.html')

@app.route('/api/scan', methods=['GET'])
def scan_wifi():
    try:
        raw_networks = scanner.scan_networks()
        processed_networks = []
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        timestamp = datetime.datetime.now().isoformat()
        
        for net in raw_networks:
            risk = analyze_risk(net['encryption'])
            signal_label = get_signal_label(net['signal'])
            
            processed_net = {
                "ssid": net['ssid'],
                "bssid": net['bssid'],
                "signal": f"{net['signal']} dBm ({signal_label})",
                "channel": net['channel'],
                "encryption": net['encryption'],
                "risk": risk['level'],
                "risk_score": risk['score'],
                "recommendation": risk['recommendation']
            }
            processed_networks.append(processed_net)
            
            # Save to history
            c.execute("INSERT INTO scans (timestamp, ssid, bssid, signal, encryption, risk_level) VALUES (?, ?, ?, ?, ?, ?)",
                      (timestamp, net['ssid'], net['bssid'], net['signal'], net['encryption'], risk['level']))
            
        conn.commit()
        conn.close()
        
        return jsonify({"networks": processed_networks, "count": len(processed_networks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 50")
    rows = c.fetchall()
    conn.close()
    
    history = [dict(row) for row in rows]
    return jsonify(history)

@app.route('/api/speedtest', methods=['GET'])
def run_speedtest():
    try:
        st = speedtest.Speedtest()
        st.get_best_server()
        download = st.download() / 1_000_000  # Convert to Mbps
        upload = st.upload() / 1_000_000      # Convert to Mbps
        ping = st.results.ping
        
        return jsonify({
            "download": round(download, 2),
            "upload": round(upload, 2),
            "ping": round(ping, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Wi-Fi Security Analyzer Backend Running...")
    print("Note: Run as Administrator/Root for full scanning capabilities.")
    app.run(debug=True, port=5000)

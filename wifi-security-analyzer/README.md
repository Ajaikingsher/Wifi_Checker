# Wi-Fi Security Analyzer 🛡️📡

A professional-grade cybersecurity tool built for scanning nearby Wi-Fi networks, analyzing their security configurations, and detecting potential vulnerabilities.

![Dashboard Mockup](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000)

## 🎯 Project Goal
To provide an educational tool for cybersecurity students and professionals to visualize local network security, identify weak encryption (WEP/Open), and understand the risks associated with different Wi-Fi configurations.

## 🚀 Features
- **Real-time Wi-Fi Scanning**: Detects nearby SSIDs, BSSIDs, Channels, and Signal Strength.
- **Security Risk Analysis**: Automatically categorizes networks as **Safe**, **Medium Risk**, or **High Risk**.
- **Vulnerability Detection**: Identifies Open networks and legacy encryption standards (WEP).
- **Modern Dashboard**: Cybersecurity-themed dark UI with smooth animations and responsive design.
- **Scan History**: Saves previous scans to a local SQLite database for trend analysis.
- **Detailed Recommendations**: Actionable advice for each detected network based on its configuration.

## 🛠️ Tech Stack
- **Backend**: Python 3, Flask, Scapy, pywifi
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3 (Custom Dark Theme), JavaScript (ES6+)
- **Styling**: Bootstrap 5 + FontAwesome 6

## 📋 Installation & Setup

### 1. Prerequisites
- Python 3.8+
- **Administrator/Root Privileges** (Required for wireless hardware access)

### 2. Clone and Install
```bash
git clone https://github.com/yourusername/wifi-security-analyzer.git
cd wifi-security-analyzer/backend
pip install -r requirements.txt
```

### 3. Running the Application
**Windows (Run as Administrator):**
```bash
python app.py
```

**Linux (Run as Sudo):**
```bash
sudo python3 app.py
```

Access the dashboard at: `http://127.0.0.1:5000`

## ⚠️ Ethical Disclaimer
This tool is for **educational and ethical use only**. Unauthorized access to or interference with networks you do not own is illegal. Always obtain explicit permission before performing security assessments.

## 📄 Resume Description
**Wi-Fi Security Analyzer | Python, Flask, Scapy, SQLite**
- Developed a full-stack cybersecurity tool to scan and analyze 802.11 wireless networks for security vulnerabilities.
- Implemented a risk-scoring algorithm to categorize networks based on encryption standards (WEP, WPA2, WPA3).
- Designed a modern, responsive dashboard with real-time data visualization using JavaScript and custom CSS.
- Integrated SQLite for persistent storage of scan history and network security trends.

## 🔧 Common Fixes & Troubleshooting
- **No Networks Found**: Ensure your Wi-Fi is turned on and the script is running with Admin/Sudo privileges.
- **Interface Error**: If you have multiple Wi-Fi cards, you may need to adjust the interface index in `scanner.py`.
- **Permission Denied**: On Linux, use `chmod +x` if needed or run with `sudo`.

---
*Created for Portfolio/Internship demonstration.*

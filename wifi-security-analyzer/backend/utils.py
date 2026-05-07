def analyze_risk(encryption):
    """
    Analyzes the risk level based on the encryption type.
    """
    encryption = encryption.upper()
    
    if "OPEN" in encryption or not encryption:
        return {
            "level": "High",
            "score": 90,
            "recommendation": "Network is unencrypted. Anyone can intercept your traffic. Use a VPN or avoid this network."
        }
    elif "WEP" in encryption:
        return {
            "level": "High",
            "score": 85,
            "recommendation": "WEP is obsolete and can be cracked in minutes. Upgrade to WPA2 or WPA3."
        }
    elif "WPA" in encryption and "WPA2" not in encryption:
        return {
            "level": "Medium",
            "score": 50,
            "recommendation": "WPA is outdated. Use WPA2 with a strong password if possible."
        }
    elif "WPA2" in encryption:
        return {
            "level": "Low",
            "score": 10,
            "recommendation": "WPA2 is generally secure. Ensure you use a complex passphrase (12+ characters)."
        }
    elif "WPA3" in encryption:
        return {
            "level": "Safe",
            "score": 0,
            "recommendation": "Modern encryption detected. This is currently the most secure standard."
        }
    
    return {
        "level": "Unknown",
        "score": 30,
        "recommendation": "Encryption type couldn't be fully verified. Exercise caution."
    }

def get_signal_label(dbm):
    """
    Converts dBm to human-readable strength.
    """
    try:
        val = int(dbm)
        if val >= -50:
            return "Excellent"
        elif val >= -60:
            return "Good"
        elif val >= -70:
            return "Fair"
        else:
            return "Weak"
    except:
        return "Unknown"

def format_vendor(bssid):
    """
    Placeholder for MAC vendor lookup logic.
    Real implementation would use a local OUI database or an API.
    """
    # Just a mock for now
    return "Unknown Vendor"

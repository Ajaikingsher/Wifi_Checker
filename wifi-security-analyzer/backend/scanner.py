import pywifi
from pywifi import const
import time
import platform
import subprocess
import re

class WifiScanner:
    """
    Core scanning logic for Wi-Fi networks.
    Supports Windows and Linux.
    """
    
    def __init__(self):
        self.wifi = pywifi.PyWiFi()
        self.iface = self.wifi.interfaces()[0]  # Use the first wireless interface

    def scan_networks(self):
        """
        Triggers a scan and returns a list of network objects.
        """
        self.iface.scan()
        time.sleep(2)  # Wait for scan to complete
        results = self.iface.scan_results()
        
        networks = []
        for network in results:
            # Clean SSID
            ssid = network.ssid if network.ssid else "Hidden Network"
            
            # Map encryption types
            encryption = self._get_encryption_type(network)
            
            # Signal strength calculation
            signal = network.signal
            
            networks.append({
                "ssid": ssid,
                "bssid": network.bssid,
                "signal": signal,
                "channel": self._get_channel(network),
                "encryption": encryption,
                "raw_auth": network.auth,
                "raw_akm": network.akm
            })
            
        return networks

    def _get_encryption_type(self, network):
        """
        Maps pywifi constants to human-readable encryption types.
        """
        akm = network.akm
        if not akm:
            return "Open"
        
        types = []
        if const.AKM_TYPE_WPA in akm:
            types.append("WPA")
        if const.AKM_TYPE_WPAPSK in akm:
            types.append("WPA-PSK")
        if const.AKM_TYPE_WPA2 in akm:
            types.append("WPA2")
        if const.AKM_TYPE_WPA2PSK in akm:
            types.append("WPA2-PSK")
            
        return "/".join(types) if types else "Unknown"

    def _get_channel(self, network):
        """
        In some environments, channel info isn't directly in pywifi results.
        We can approximate or use subprocess as fallback if needed.
        """
        # pywifi usually doesn't provide channel directly in all versions
        # This is a placeholder or simplified logic
        return "Unknown"

    def get_scanner_fallback(self):
        """
        Fallback using subprocess for OS-specific commands if pywifi fails.
        """
        if platform.system() == "Windows":
            return self._scan_windows()
        else:
            return self._scan_linux()

    def _scan_windows(self):
        try:
            cmd = "netsh wlan show networks mode=bssid"
            output = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
            # Parsing logic would go here
            return [] # Placeholder for now
        except Exception:
            return []

    def _scan_linux(self):
        try:
            cmd = "nmcli -f SSID,BSSID,SIGNAL,CHAN,SECURITY dev wifi"
            output = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
            # Parsing logic would go here
            return [] # Placeholder for now
        except Exception:
            return []

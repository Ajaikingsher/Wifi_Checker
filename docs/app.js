document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const speedTestBtn = document.getElementById('speedTestBtn');
    const resultsBody = document.getElementById('resultsBody');
    const loader = document.getElementById('loader');
    const speedLoader = document.getElementById('speedLoader');
    const speedResults = document.getElementById('speedResults');
    const searchInput = document.getElementById('searchInput');
    const totalNetworks = document.getElementById('totalNetworks');
    const riskNetworks = document.getElementById('riskNetworks');
    const safeNetworks = document.getElementById('safeNetworks');
    const scanTime = document.getElementById('scanTime');

    let allNetworks = [];
    let speedChart, signalChart;

    // Initialize Charts
    const initCharts = () => {
        const ctxSpeed = document.getElementById('speedChart').getContext('2d');
        speedChart = new Chart(ctxSpeed, {
            type: 'bar',
            data: {
                labels: ['Download', 'Upload'],
                datasets: [{
                    label: 'Mbps',
                    data: [0, 0],
                    backgroundColor: ['rgba(0, 242, 255, 0.5)', 'rgba(46, 204, 113, 0.5)'],
                    borderColor: ['#00f2ff', '#2ecc71'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, grid: { color: '#2d313d' } } }
            }
        });

        const ctxSignal = document.getElementById('signalChart').getContext('2d');
        signalChart = new Chart(ctxSignal, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Signal Strength (dBm)',
                    data: [],
                    borderColor: '#00f2ff',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(0, 242, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { grid: { color: '#2d313d' } } }
            }
        });
    };

    initCharts();

    const startScan = async () => {
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> SCANNING...';
        loader.classList.remove('d-none');
        resultsBody.innerHTML = '';
        
        try {
            const response = await fetch('/api/scan');
            const data = await response.json();
            
            if (data.error) {
                showError(data.error);
                return;
            }

            allNetworks = data.networks;
            renderResults(allNetworks);
            updateStats(allNetworks);
            updateSignalChart(allNetworks);
            
            const now = new Date();
            scanTime.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                                  now.getMinutes().toString().padStart(2, '0');

        } catch (err) {
            showError("Could not connect to the backend server.");
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="fas fa-radar me-1"></i> START SCAN';
            loader.classList.add('d-none');
        }
    };

    const runSpeedTest = async () => {
        speedTestBtn.disabled = true;
        speedLoader.classList.remove('d-none');
        speedResults.classList.add('d-none');

        try {
            const response = await fetch('/api/speedtest');
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            document.getElementById('downloadSpeed').textContent = data.download;
            document.getElementById('uploadSpeed').textContent = data.upload;
            document.getElementById('pingTime').textContent = data.ping;

            speedChart.data.datasets[0].data = [data.download, data.upload];
            speedChart.update();

        } catch (err) {
            alert("Speed test failed: " + err.message);
        } finally {
            speedTestBtn.disabled = false;
            speedLoader.classList.add('d-none');
            speedResults.classList.remove('d-none');
        }
    };

    const updateSignalChart = (networks) => {
        const top5 = networks.slice(0, 8);
        signalChart.data.labels = top5.map(n => n.ssid || 'Hidden');
        signalChart.data.datasets[0].data = top5.map(n => parseInt(n.signal));
        signalChart.update();
    };

    const renderResults = (networks) => {
        if (networks.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="6" class="text-center py-5">No networks found.</td></tr>';
            return;
        }

        resultsBody.innerHTML = networks.map(net => {
            const riskClass = `risk-${net.risk.toLowerCase()}`;
            const signalLevel = getSignalLevel(net.signal);
            
            return `
                <tr>
                    <td><div class="ssid-text">${net.ssid || '<i>Hidden</i>'}</div></td>
                    <td><span class="bssid-text">${net.bssid}</span></td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="signal-indicator me-2">
                                <div class="signal-bar signal-1 ${signalLevel >= 1 ? 'active' : ''}"></div>
                                <div class="signal-bar signal-2 ${signalLevel >= 2 ? 'active' : ''}"></div>
                                <div class="signal-bar signal-3 ${signalLevel >= 3 ? 'active' : ''}"></div>
                                <div class="signal-bar signal-4 ${signalLevel >= 4 ? 'active' : ''}"></div>
                            </div>
                            <small class="text-muted">${net.signal}</small>
                        </div>
                    </td>
                    <td><span class="badge bg-dark border border-secondary">${net.encryption}</span></td>
                    <td><span class="badge-risk ${riskClass}">${net.risk}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewAnalysis('${net.bssid}')">
                            <i class="fas fa-magnifying-glass-chart"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    const updateStats = (networks) => {
        totalNetworks.textContent = networks.length;
        riskNetworks.textContent = networks.filter(n => n.risk === 'High').length;
        safeNetworks.textContent = networks.filter(n => n.risk === 'Low' || n.risk === 'Safe').length;
    };

    const getSignalLevel = (signalStr) => {
        const dbm = parseInt(signalStr);
        if (dbm >= -50) return 4;
        if (dbm >= -60) return 3;
        if (dbm >= -70) return 2;
        return 1;
    };

    const showError = (msg) => {
        resultsBody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger"><strong>ERROR:</strong> ${msg}</td></tr>`;
    };

    window.viewAnalysis = (bssid) => {
        const net = allNetworks.find(n => n.bssid === bssid);
        if (!net) return;
        const modal = new bootstrap.Modal(document.getElementById('analysisModal'));
        document.getElementById('modalTitle').textContent = `Analysis: ${net.ssid || net.bssid}`;
        let riskColor = net.risk === 'High' ? '#ff4d4d' : (net.risk === 'Medium' ? '#ffcc00' : '#2ecc71');
        document.getElementById('modalContent').innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center mb-3">
                    <div class="risk-meter" style="border: 4px solid ${riskColor}; padding: 20px; border-radius: 50%; width: 120px; height: 120px; margin: 0 auto; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <h4 class="m-0" style="color: ${riskColor}">${net.risk_score}%</h4>
                        <small class="text-muted">RISK</small>
                    </div>
                </div>
                <div class="col-md-8">
                    <h5>Security Recommendation</h5>
                    <div class="alert bg-dark border-secondary"><i class="fas fa-lightbulb text-warning me-2"></i>${net.recommendation}</div>
                    <ul class="list-group list-group-flush bg-transparent mt-3">
                        <li class="list-group-item bg-transparent text-light border-secondary"><strong>MAC:</strong> ${net.bssid}</li>
                        <li class="list-group-item bg-transparent text-light border-secondary"><strong>Encryption:</strong> ${net.encryption}</li>
                    </ul>
                </div>
            </div>`;
        modal.show();
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderResults(allNetworks.filter(n => (n.ssid || '').toLowerCase().includes(term) || n.bssid.toLowerCase().includes(term)));
    });

    scanBtn.addEventListener('click', startScan);
    speedTestBtn.addEventListener('click', runSpeedTest);
});

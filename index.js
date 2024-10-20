const { Client } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');
const app = express();

let qrCodeData = '';  // Store the raw QR code string here
let client = null;    // WhatsApp client will be initialized when the user requests the QR

// Serve the webpage with the "Generate QR" button
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>WhatsApp QR Code Generator</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
        </head>
        <body>
            <h2>Click the button to generate WhatsApp QR code</h2>
            <button onclick="generateQr()">Generate QR Code</button>
            <div id="qr-container" style="margin-top: 20px;"></div>
            <script>
                function generateQr() {
                    fetch('/start-whatsapp')
                        .then(response => response.json())
                        .then(data => {
                            if (data.qr) {
                                var qrContainer = document.getElementById('qr-container');
                                qrContainer.innerHTML = '<canvas id="qrcode"></canvas>';
                                var qr = new QRious({
                                    element: document.getElementById('qrcode'),
                                    size: 300,
                                    value: data.qr
                                });
                            } else {
                                alert(data.message || 'QR code generation failed.');
                            }
                        })
                        .catch(error => {
                            alert('An error occurred: ' + error.message);
                        });
                }
            </script>
        </body>
        </html>
    `);
});

// Endpoint to start WhatsApp client and generate QR code
app.get('/start-whatsapp', (req, res) => {
    // If client is already running, return the existing QR code
    if (client && qrCodeData) {
        return res.json({ qr: qrCodeData });
    }

    try {
        client = new Client();
        
        client.on('qr', (qr) => {
            qrCodeData = qr;  // Store the raw QR code string
            console.log('QR code generated successfully.');
        });

        client.on('ready', () => {
            console.log('WhatsApp client is ready!');
        });

        client.on('message', message => {
            if (message.body.toLowerCase() === 'good morning') {
                message.reply('Good Morning Friend');
            }
        });

        client.initialize();
        
        res.json({ message: 'WhatsApp client started. Please wait for the QR code.' });

    } catch (error) {
        console.error('Error initializing WhatsApp client:', error);
        res.status(500).json({ message: 'Failed to initialize WhatsApp client.' });
    }
});

// Basic health check
app.get('/health', (req, res) => {
    res.send('Server is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const { Client } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');
const app = express();

let qrCodeData = '';  // To store the raw QR code string
let client = null;    // WhatsApp client initialized only when button is clicked

// Serve the webpage with the Generate QR button
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
                                alert('QR code generation failed.');
                            }
                        });
                }
            </script>
        </body>
        </html>
    `);
});

// Endpoint to start WhatsApp client and generate QR code
app.get('/start-whatsapp', (req, res) => {
    if (!client) {
        client = new Client();

        client.on('qr', (qr) => {
            qrCodeData = qr;
            qrcode.generate(qr, { small: true });
            console.log('QR Code generated.');
        });

        client.on('ready', () => {
            console.log('WhatsApp bot is ready!');
        });

        client.on('message', message => {
            if (message.body.toLowerCase() === 'good morning') {
                message.reply('Good Morning Friend');
            }
        });

        client.initialize();

        res.json({ status: 'WhatsApp client started, QR code will be generated soon.' });
    } else if (qrCodeData) {
        // If QR code already exists
        res.json({ qr: qrCodeData });
    } else {
        // If client is initializing but QR is not yet available
        res.json({ status: 'QR code is being generated, please try again in a few moments.' });
    }
});

// Basic health check
app.get('/health', (req, res) => {
    res.send('Server is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

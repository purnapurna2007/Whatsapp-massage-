const { Client } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');  // Use this for generating QR code images
const app = express();

let client = null;    // WhatsApp client initialized only when button is clicked

// Serve the webpage with the Generate QR button
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>WhatsApp QR Code Generator</title>
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
                                qrContainer.innerHTML = '<img src="' + data.qr + '" alt="WhatsApp QR Code"/>';
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
    if (!client) {
        client = new Client();

        client.on('qr', async (qr) => {
            try {
                const qrImage = await qrcode.toDataURL(qr);  // Convert QR code to base64 image
                res.json({ qr: qrImage });
            } catch (error) {
                console.error('Error generating QR code:', error);
                res.status(500).json({ message: 'Error generating QR code.' });
            }
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
    } else {
        res.json({ message: 'WhatsApp client already running.' });
    }
});

// Basic health check
app.get('/health', (req, res) => {
    res.send('Server is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

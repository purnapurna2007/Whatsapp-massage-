const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const app = express();

let client = null; // WhatsApp client
let qrCodeData = null; // To store the latest QR code

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

                // Auto-refresh the QR code every 10 minutes
                setInterval(() => {
                    generateQr();
                }, 10 * 60 * 1000); // 10 minutes in milliseconds
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
                qrCodeData = await qrcode.toDataURL(qr); // Convert QR code to base64 image
                res.json({ qr: qrCodeData });
            } catch (error) {
                console.error('Error generating QR code:', error);
                res.status(500).json({ message: 'Error generating QR code.' });
            }
        });

        client.on('ready', () => {
            console.log('WhatsApp client is ready!');
        });

        client.on('message', async (message) => {
            if (message.body.toLowerCase() === 'link') {
                try {
                    // Load an image from the file system (use any image path or URL)
                    const imagePath = path.join(__dirname, '29dd5eb430ec9701f9d2e8908594eaee.jpg'); // Replace with your image path
                    const media = MessageMedia.fromFilePath(imagePath);
                    
                    // Text caption to be sent with the image
                    const caption = `*𝗗𝗘𝗫𝗧𝗘𝗥 ┃ AUTO STATUS SEEN* ♨

https://wa.me/message/5AUBZLIL7HM6D1

[____________________]

*DEXTER LINK WITH DEXTER CONTACT*😾
*DEXTER  PROGRAMS* 💀`;

                    // Send the image along with the caption
                    await client.sendMessage(message.from, media, { caption: caption });

                } catch (error) {
                    console.error('Failed to send image with caption:', error);
                }
            }
        });

        client.initialize();
    } else {
        // If QR code already exists, send the cached QR code
        if (qrCodeData) {
            res.json({ qr: qrCodeData });
        } else {
            res.json({ message: 'WhatsApp client already running but no QR code found.' });
        }
    }
});

// Basic health check
app.get('/health', (req, res) => {
    res.send('Server is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

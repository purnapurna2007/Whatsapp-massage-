const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();

let qrCodeImage = ""; // To store the QR code data URL

const client = new Client();

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error generating QR code', err);
        } else {
            qrCodeImage = url; // Store QR code as a data URL
        }
    });
    console.log("QR code generated. You can now scan it via the website.");
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

// Serve the QR code on a webpage
app.get('/qr', (req, res) => {
    if (qrCodeImage) {
        res.send(`<html><body><h2>Scan the QR Code to connect WhatsApp</h2><img src="${qrCodeImage}" /></body></html>`);
    } else {
        res.send('QR code not yet generated. Please refresh in a few moments.');
    }
});

// Basic health check endpoint
app.get('/', (req, res) => {
    res.send('WhatsApp bot is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

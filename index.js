const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan the QR code to connect WhatsApp.");
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

// For Render to keep the bot alive
app.get('/', (req, res) => {
    res.send('WhatsApp bot is running.');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

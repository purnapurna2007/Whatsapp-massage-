// server.js
const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Twilio credentials
const accountSid = 'AC3703d9bed80e3a199b5d4abc7007d6f4';
const authToken = '0cb4f4d9765b6217df5ea8c6bcb7e939';
const client = new twilio(accountSid, authToken);

// WhatsApp Number (Twilio Verified Number)
const fromWhatsApp = 'whatsapp:+19382016013';

app.post('/send-whatsapp', (req, res) => {
    const { phoneNumber, message } = req.body;

    client.messages.create({
        body: message,
        from: fromWhatsApp,
        to: `whatsapp:${phoneNumber}`,
    })
    .then(message => {
        console.log('Message sent:', message.sid);
        res.json({ success: true });
    })
    .catch(err => {
        console.error('Error sending message:', err);
        res.json({ success: false });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

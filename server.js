// server.js
const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Twilio credentials
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = new twilio(accountSid, authToken);

// WhatsApp Number (Twilio Verified Number)
const fromWhatsApp = 'whatsapp:+14155238886';

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

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const app = express();

// Twilio Credentials
const accountSid = 'AC3703d9bed80e3a199b5d4abc7007d6f4';
const authToken = '0cb4f4d9765b6217df5ea8c6bcb7e939';
const client = new twilio(accountSid, authToken);

app.use(bodyParser.json());

app.post('/send-whatsapp', (req, res) => {
    const phone = req.body.phone;

    // Message 1: "Dexter"
    client.messages.create({
        from: 'whatsapp:+19382016013',
        to: `whatsapp:${phone}`,
        body: 'Dexter'
    }).then(() => {
        // Message 2: "Contact us: +94789958225"
        return client.messages.create({
            from: 'whatsapp:+YOUR_TWILIO_WHATSAPP_NUMBER',
            to: `whatsapp:${phone}`,
            body: 'Contact us: +94789958225'
        });
    }).then(() => {
        res.json({ message: 'Messages sent successfully!' });
    }).catch(err => {
        res.json({ message: 'Failed to send messages!', error: err });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

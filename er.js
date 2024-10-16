const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public folder

// Retrieve Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC3703d9bed80e3a199b5d4abc7007d6f4'; // Replace with your Twilio account SID
const authToken = process.env.TWILIO_AUTH_TOKEN || '0cb4f4d9765b6217df5ea8c6bcb7e939'; // Replace with your Twilio auth token
const client = new twilio(accountSid, authToken);

let otpStorage = {}; // To temporarily store OTPs

app.post('/sendOTP', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    otpStorage[phone] = otp;

    client.messages.create({
        body: `Your OTP is ${otp}`,
        from: 'whatsapp:+19382016013', // Use your Twilio WhatsApp number
        to: `whatsapp:${phone}`
    }).then(message => {
        res.json({ success: true });
    }).catch(error => {
        res.json({ success: false, error });
    });
});

app.post('/verifyOTP', (req, res) => {
    const { phone, otp } = req.body;
    if (otpStorage[phone] && otpStorage[phone] == otp) {
        delete otpStorage[phone]; // Remove OTP after verification
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html from public folder
});

app.get('/nextPage', (req, res) => {
    res.send('<h1>OTP Verified! Welcome to the next page.</h1>');
});

// Export the app for Vercel
module.exports = app;

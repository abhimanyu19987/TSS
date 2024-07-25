const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Setup Twilio
const accountSid = 'AC9bfab0c39509645a3b830a15871f6081'; // Your Account SID from www.twilio.com/console
const authToken = 'd3e297bcfb06ffb78f303f64825804ea';   // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

app.post('/api/contact', (req, res) => {
  const { name, website, phone, address, email, inquiry, message } = req.body;

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'admin-email@example.com',
    subject: `New Inquiry from ${name}`,
    text: `Name: ${name}\nWebsite: ${website}\nPhone: ${phone}\nAddress: ${address}\nEmail: ${email}\nInquiry: ${inquiry}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    console.log('Email sent: ' + info.response);
  });

  // Send SMS
  client.messages.create({
    body: `New Inquiry from ${name}. Phone: ${phone}, Email: ${email}`,
    to: '+admin-phone-number',  // Admin's phone number
    from: '+your-twilio-phone-number' // From a valid Twilio number
  })
  .then((message) => console.log(message.sid))
  .catch((error) => console.error(error));

  res.status(200).send('Form submitted successfully');
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Server started on port ${port}`));

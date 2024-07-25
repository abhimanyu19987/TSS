const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  message: String
});

const Contact = mongoose.model('Contact', contactSchema);

app.post('/api/contact', async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const contact = new Contact({ name, phone, email, message });
    await contact.save();

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${process.env.ADMIN_PHONE_NUMBER}&text=${encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`
    )}`;
    res.status(200).json({ whatsappUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

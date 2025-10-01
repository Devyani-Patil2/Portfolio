// controllers/contactController.js
const Joi = require('joi');
const Message = require('../models/Message');
const nodemailer = require('nodemailer');


const contactSchema = Joi.object({
name: Joi.string().min(2).max(100).required(),
email: Joi.string().email().required(),
message: Joi.string().min(5).max(2000).required()
});


async function sendNotificationEmail(env, payload) {
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO } = env;
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) return; // email not configured


const transporter = nodemailer.createTransport({
host: SMTP_HOST,
port: Number(SMTP_PORT) || 587,
secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
auth: {
user: SMTP_USER,
pass: SMTP_PASS
}
});


const mailOptions = {
from: `Portfolio Contact <${SMTP_USER}>`,
to: EMAIL_TO,
subject: `New message from ${payload.name}`,
text: `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`,
html: `<p><strong>Name:</strong> ${payload.name}</p><p><strong>Email:</strong> ${payload.email}</p><hr/><p>${payload.message}</p>`
};


await transporter.sendMail(mailOptions);
}


exports.submitContact = async (req, res, next) => {
try {
const { error, value } = contactSchema.validate(req.body);
if (error) return res.status(400).json({ error: error.details[0].message });


// Save message
const msg = new Message(value);
await msg.save();


// Optional: send email notification (non-blocking)
sendNotificationEmail(process.env, value).catch(err => console.warn('Email error:', err.message));


return res.status(201).json({ message: 'Message received. Thank you!' });
} catch (err) {
next(err);
}
};
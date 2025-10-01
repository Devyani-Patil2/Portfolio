// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');


const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const errorHandler = require('./middlewares/errorHandler');


const app = express();


// Connect to DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
connectDB(MONGO_URI);


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


// Rate limiter for contact endpoint
const limiter = rateLimit({
windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
max: Number(process.env.RATE_LIMIT_MAX) || 10,
message: { error: 'Too many requests, please try again later.' }
});


// Routes
app.use('/api/contact', limiter, contactRoutes);


// Serve public/static assets (resume, profile photo) from /public
app.use(express.static(path.join(__dirname, 'public')));


// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));


// Error handling
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
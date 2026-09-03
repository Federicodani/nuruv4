const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const jobRoutes = require('./routes/jobRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const constantsRoutes = require('./routes/constantsRoutes');
const constructionProjectRoutes = require('./routes/constructionProjectRoutes');
const locationRoutes = require('./routes/locationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const estimatorRoutes = require('./routes/estimatorRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nuruv4.vercel.app/"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Nuru Construction Hub API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/constants', constantsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/estimator', estimatorRoutes);
app.use('/api/construction-projects', constructionProjectRoutes);
app.use('/api/location', locationRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

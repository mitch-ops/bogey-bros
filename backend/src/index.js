const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());  // Middleware to parse JSON
app.use(authRoutes);       // Use auth routes
app.use(userRoutes);       // Use user routes

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// src/index.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());  
app.use(userRoutes);     

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

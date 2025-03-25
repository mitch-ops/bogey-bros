const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes/routes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());  // Middleware to parse JSON
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
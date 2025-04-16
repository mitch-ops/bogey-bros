const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes/routes');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json()); 
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
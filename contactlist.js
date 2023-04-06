const express = require('express');
require('dotenv').config();
const contact = require('./routes/contact')
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use('/contact', contact);
app.listen(port, () => {
  console.log(`Server running at port ${ port }`);
});
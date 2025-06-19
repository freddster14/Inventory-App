const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();
const PORT = 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.urlencoded({ extended: true }));
app.use('/', (req, res) => res.send('working'));

app.listen(PORT);

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const mainRouter = require('./routes/main');
const categoryRouter = require('./routes/categoryRouter');
const itemRouter = require('./routes/itemRouter');

const app = express();
const PORT = 3000;
const assestsPath = path.join(__dirname, 'public/styles');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(assestsPath));
app.use(express.urlencoded({ extended: true }));
app.use('/category', categoryRouter);
app.use('/item', itemRouter);
app.use('/', mainRouter);

app.listen(PORT);

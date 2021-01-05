let appInsights = require('applicationinsights');
appInsights.setup("YOUR_IKEY").start();

var createError = require('http-errors');
var express = require('express');
var fetch = require('node-fetch');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var redis = require('redis');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var REDIS_PORT = process.env.PORT || '6379';

const client = redis.createClient(REDIS_PORT);

var app = express();

// Set response
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} github repos.</h2>`;
}

// Make reuquest to Github for data
async function getRepos(req, res, next) {
  try {
    console.log('Fetching Data...');
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    const repos = data.public_repos;
    // set data to Redis cache
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}

// Cache middleware 
function cache(req, res, next) {
  const { username } = req.params;
  client.get(username, (err, data) => {
    if(err) throw err;
    if(data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  })
}

app.use('/repos/:username', cache, getRepos);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

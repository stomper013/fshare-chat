var express = require('express');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo/es5')(expressSession);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
require("dotenv").config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
			genid: function(req) {return uuid.v4()},
			secret: "q1w2fR50lOg",
			cookie: { maxAge: 1000*30*24*60 },
			resave: true,
			saveUninitialized: true,
			store:new MongoStore({
        url: process.env.MONGO_URI,useNewUrlParser: true, useUnifiedTopology: true,
				auto_Reconnect:true,
			})
}));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/join');
var chat = require('./routes/chat');
var admin = require('./routes/index');

app.use('/', routes);
app.use('/chat',chat);
app.use('/admin',admin)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;



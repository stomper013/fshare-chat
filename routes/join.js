var express = require('express');
var router = express.Router();
var expressSession = require('../node_modules/express-session');
var UAParser = require('../node_modules/ua-parser-js');
var uuid = require('../node_modules/node-uuid');
var MongoClient = require('mongodb').MongoClient;

var mongoURI = "mongodb://localhost:27017/express";


router.get('/', function(req, res, next) {
   var parser = new UAParser();
   var ua = req.headers['user-agent'];
   var browserName = parser.setUA(ua).name;
   var fullBrowserVersion = parser.setUA(ua).getBrowser().version;
   var text = 'Guest';

   var uid  = req.session.username = (!req.session.username) ? text + '-' + uuid.v4().substring(0,8) : req.session.username;

   console.log('Connect: ' + uid )

   var room = /\/\?room=(\d+)$/.exec(req.url);
   room = (room !== null ) ? room[1] : 'online';

   req.session.room = room;

   res.redirect('/chat');

});

module.exports = router;


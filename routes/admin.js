var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;


router.get("/", function (req, res, next) {
  var room = req.session.room;
  var roomUsers = [];
  var mongoURI = process.env.MONGO_URI;

  MongoClient.connect(mongoURI, function (err, db) {
    if (err) {
      return console.dir(err);
    }
    res.render("admin", {
      room: room,
      roomUsers: roomUsers,
    });
  });
});

module.exports = router;

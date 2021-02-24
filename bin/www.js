var app = require("../app");
var debug = require("debug")("app:server");
var http = require("http");

var port = normalizePort(process.env.PORT || process.argv[2] || "4000");
app.set("port", port);
console.log("listening port:" + port);

var server = http.createServer(app);

var io = require("socket.io")(server);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) { // named pipe
        return val;
    }

    if (port >= 0) { // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}

var MongoClient = require("mongodb").MongoClient;
const {indexOf} = require("underscore");
var mongoURI = "mongodb://localhost:27017/express";
var roomUsers = [];

io.sockets.on("connection", function (socket) {
    socket.on("joinRoom", function (name, roomToJoinTo) {
        MongoClient.connect(mongoURI, function (err, db) {
            if (err) {
                return console.dir(err);
            }

            db.collection("rooms").update({
                _id: roomToJoinTo
            }, {
                $push: {
                    users: name
                }
            }, {upsert: true});

            var stream = db.collection("rooms").find({
                _id: roomToJoinTo
            }, {users: 1});
            stream.on("data", function (item) {
                roomUsers[socket.id] = {
                    "name": name,
                    "inroom": roomToJoinTo
                };
                io.emit("joined", JSON.stringify(item.users));
                console.log('new-user-joined name: %s roomToJoinTo: %s', name, roomToJoinTo);
                socket.broadcast.emit("new-user-joined", name, roomToJoinTo);
            });
        });
    });

    socket.on("private", function (admin ,data, sendto) {
    //client k nhận
        // socket.emit("private-msg", {
        //     from: socket.nickname,
        //     msg: data,
        //     to: sendto
        // });
        io.emit("private-msg-a", {
            from: sendto,
            msg: data,
            to: admin
        });

        io.emit("private-msg-b", {
            from: sendto,
            msg: data,
            to: admin
        });
        
        // console.log(socket.nickname, data, sendto)
    });

    socket.on("disconnect", function () {
        if (typeof roomUsers[socket.id] !== 'undefined') {
            io.emit("user-left-room", roomUsers[socket.id].inroom, roomUsers[socket.id].name);
            sessionDel(roomUsers[socket.id].inroom, roomUsers[socket.id].name);
        }
    });
});

function sessionDel(room, user) {
    MongoClient.connect(mongoURI, function (err, db) {
        if (err) {
            return console.dir(err);
        }
        console.log("User %s disconnected from room #%s", user, room);
        db.collection("rooms").update({
            _id: room
        }, {
            $pull: {
                users: user
            }
        }, {upsert: true});
        db.collection("sessions").remove({
            session: new RegExp('\\"username\\":\\"' + user + '\\",\\"room\\":\\"' + room + '\\"')
        });
    });
}

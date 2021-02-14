var express = require('express');
const cors = require('cors');
require('./routes/index');
const users = {};
var app = express();
var server = require('http').Server(app);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
};

var io = require('socket.io')(server, {
    cors: corsOptions
});

const whitelist = ['http://localhost:3000', 'https://front-end-dot-operating-land-304706.wm.r.appspot.com', 'https://calgaryhacks2021-g7.github.io'];

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.use(function(req, res, next){
    res.io = io;
    next();
});

app.use(cors(corsOptions));

io.on('connection', socket => {
    console.log('User connected');
    if(!users[socket.id]){
        users[socket.id] = socket.id;
    }
    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    socket.on('disconnect', () =>{
        delete users[socket.id];
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    })

    socket.on("updateEditor", (text, roomid) => {
    })

    socket.on("joinroom", (roomid) => {
        socket.join(roomid);
        io.to(roomid).emit("receivemessage", socket.id + "has joined the room");
    })

    socket.on("sendmessage", (roomid) => {
        io.to(roomid).emit("receivemessage", msg);
    })

    socket.on("leaveroom", (roomid) => {
        socket.leave(roomid);
        io.to(roomid).emit("receivemessage", socket.id + "has left the room");
    })

});

module.exports = {app: app, server: server};

var express = require('express');
const cors = require('cors');
require('./routes/index');
const users = {};
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000, https://front-end-dot-operating-land-304706.wm.r.appspot.com",
        methods: ["GET", "POST"],
        credentials: true
    }
});

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

app.use(cors({credentials: true, origin: 'http://localhost:3000, https://front-end-dot-operating-land-304706.wm.r.appspot.com'}));

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
});

module.exports = {app: app, server: server};

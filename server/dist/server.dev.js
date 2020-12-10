"use strict";

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

var router = require('./router');

var cors = require('cors');

var _require = require('./users'),
    addUser = _require.addUser,
    removeUser = _require.removeUser,
    getUser = _require.getUser,
    getUsersInRomm = _require.getUsersInRomm;
/* initalization of the server */


app.use(cors());
app.use(router);
/* initialization of socket.io server */

io.on('connect', function (socket) {
  console.log("Client ".concat(socket.id, " connected"));
  socket.on('leaveRoom', function (room) {
    var user = removeUser(socket.id);
    socket.leave(user.room);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: "".concat(user.name, " has left the chat/")
      });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRomm(user.room)
      });
    }

    console.log("".concat(user.name, " has left room ").concat(user.room));
  });
  socket.on('switchRoom', function (_ref) {
    var name = _ref.name,
        oldRoom = _ref.oldRoom,
        newRoom = _ref.newRoom;
    socket.emit('leaveRoom', oldRoom);
    socket.emit('join', {
      name: name,
      newRoom: newRoom
    }, function () {});
  });
  socket.on('join', function (_ref2, callback) {
    var name = _ref2.name,
        room = _ref2.room;

    var _addUser = addUser({
      id: socket.id,
      name: name,
      room: room
    }),
        error = _addUser.error,
        user = _addUser.user;

    if (error) return callback(error);
    socket.join(user.room);
    console.log("".concat(user.name, " has join room ").concat(user.room));
    socket.emit('message', {
      user: 'admin',
      text: "".concat(user.name, " welcome to ").concat(user.room)
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: "".concat(user.name, " has joined!")
    });
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRomm(user.room)
    });
    callback();
  });
  socket.on('sendMessage', function (message, callback) {
    var user = getUser(socket.id);
    io.to(user.room).emit('message', {
      user: user.name,
      text: message
    });
    callback();
  }); // // private messages
  // socket.on("private message", (anotherSocketId, msg)=>{
  //     socket.io(anotherSocketId).emit("private message", socket.id, msg);
  // });

  socket.on('disconnect', function () {
    var user = removeUser(socket.id);
    console.log('user disconnected');

    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: "".concat(user.name, " has left the chat/")
      });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRomm(user.room)
      });
    }
  });
});
var PORT = process.env.PORT || 8080;
server.listen(PORT, function () {
  console.log("Server has been started at port: ".concat(PORT));
});
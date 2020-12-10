var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io')(server, {
    cors: {
        origin: "*",
    }
});

const router = require('./router');
const cors = require('cors');

const {addUser, removeUser, getUser, getUsersInRomm} = require('./users');

/* initalization of the server */
app.use(cors());
app.use(router);

/* initialization of socket.io server */


io.on('connect', (socket)=>{
    console.log(`Client ${socket.id} connected`);


    socket.on('leaveRoom', (room) => {
        const user = removeUser(socket.id);
        socket.leave(user.room);
        if (user) {
            io.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has left the chat/`});
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRomm(user.room)});
        }

        console.log(`${user.name} has left room ${user.room}`)
    })

    socket.on('switchRoom', ({name, oldRoom, newRoom}) => {
        socket.emit('leaveRoom', oldRoom);
        socket.emit('join',{name,newRoom}, ()=>{});
    })

    socket.on('join', ({name,room}, callback) => {
        const {error,user} = addUser({id: socket.id, name, room});
        if (error) return callback(error);

        socket.join(user.room);
        console.log(`${user.name} has join room ${user.room}`)

        socket.emit('message', {user: 'admin', text: `${user.name} welcome to ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined!` });

        io.to(user.room).emit('roomData', { room:user.room, users: getUsersInRomm(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
        callback();
    })
    // // private messages
    // socket.on("private message", (anotherSocketId, msg)=>{
    //     socket.io(anotherSocketId).emit("private message", socket.id, msg);
    // });

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        console.log('user disconnected');

        if (user) {
            io.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has left the chat/`});
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRomm(user.room)});
        }
    })
});

const PORT =  process.env.PORT || 8080;
server.listen(PORT, ()=> {console.log(`Server has been started at port: ${PORT}`)});

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server has start on port ${PORT}`)
});

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('User joined meeting');
    });
    socket.on('message', (data) => {
        io.in(data.room).emit('newMessage', {user: data.user, message: data.message});
    });
});

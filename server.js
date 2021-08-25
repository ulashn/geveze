const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const admin = 'ADMIN';

// Set static folder here!
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects to the server.
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room);

        // Welcome new user!
        // console.log('New connection...');
        socket.emit('message', formatMessage(admin, 'Welcome to the Geveze!'));

        // Broadcast when new user joins.
        socket.broadcast.to(user.room).emit('message', formatMessage(admin, `${user.username} has joined to room!`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatmsg', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    
    // Runs when client DC
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit(
                'message', 
                formatMessage(admin, `${user.username} has left the chat!`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
    });

})


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
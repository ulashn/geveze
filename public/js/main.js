const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();


// Get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


socket.emit('joinRoom', { username, room });

// Get room and users.

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});


// Message from server.
socket.on('message', message => {
    //console.log(message);
    sendMessage(message);

    // Scrolling down to the last messages!.
    chatMessages.scrollTop = chatMessages.scrollHeight;

});


// Message submit

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text here.
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Get chat message here!
    socket.emit('chatmsg', msg);

    // Clear the input field

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function sendMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time} PM</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
};

function outputRoomName(room) {
    //console.log(room);
    roomName.innerText = room;
};

function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
};


document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = './index.html';
    }
});
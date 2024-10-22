const socket = new WebSocket('ws://localhost:3000');

const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

socket.onmessage = function(event) {
    const message = document.createElement('div');
    message.textContent = event.data;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

sendButton.onclick = function() {
    const message = messageInput.value;
    if (message) {
        socket.send(message);
        messageInput.value = '';
    }
};

messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

const socket = new WebSocket('ws://localhost:3000'); // Update with your server URL
let token = ''; // Store JWT token

const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Function to handle incoming messages
socket.onmessage = function(event) {
    try {
        const message = JSON.parse(event.data); // Parse the incoming message
        displayMessage(message);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

// Function to display messages
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    if (message.type === 'PRIVATE_MESSAGE') {
        messageDiv.textContent = `Private from ${message.from}: ${message.content}`;
    } else {
        messageDiv.textContent = `${message.from}: ${message.content}`;
    }
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
}

// Send message on button click
sendButton.onclick = function() {
    const message = messageInput.value;
    if (message) {
        const messageObj = {
            type: 'PUBLIC_MESSAGE', // Specify message type
            content: message,
            // Include additional fields as necessary (e.g., recipient, timestamp)
        };
        socket.send(JSON.stringify(messageObj)); // Send structured message
        messageInput.value = ''; // Clear input
    }
};

// Send message on Enter key press
messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

// Handle WebSocket connection errors
socket.onerror = function(error) {
    console.error('WebSocket error:', error);
    alert('WebSocket error. Check console for details.');
};

// Handle connection close
socket.onclose = function() {
    console.log('WebSocket connection closed');
    alert('Disconnected from the server.');
};

// Function to send token after login
function sendToken(token) {
    if (token) {
        socket.send(JSON.stringify({ type: 'AUTH', token })); // Send token as an authentication message
    }
}

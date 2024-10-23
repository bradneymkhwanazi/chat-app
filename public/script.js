const socket = new WebSocket('wss://chat-app-608h.onrender.com/'); // Update with your server URL
let token = ''; // Store JWT token

// Cache DOM elements for efficiency
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Handle WebSocket incoming messages
socket.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data); // Parse incoming message
        displayMessage(message);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

// Display a message in the chat
function displayMessage({ type, from, content }) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = type === 'PRIVATE_MESSAGE' 
        ? `Private from ${from}: ${content}` 
        : `${from}: ${content}`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Send a message to the WebSocket server
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const messageObj = {
        type: 'PUBLIC_MESSAGE', // Message type (e.g., PUBLIC, PRIVATE)
        content: message,
        // You can add additional fields like timestamp, etc.
    };
    socket.send(JSON.stringify(messageObj)); // Send message
    messageInput.value = ''; // Clear input
}

// Event listeners for message sending
sendButton.onclick = sendMessage;
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

// WebSocket error handling
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('WebSocket error. Check console for details.');
};

// Handle WebSocket connection closure
socket.onclose = () => {
    console.log('WebSocket connection closed');
    alert('Disconnected from the server.');
};

// Send JWT token after login for authentication
function sendToken(token) {
    if (token) {
        socket.send(JSON.stringify({ type: 'AUTH', token }));
    }
}

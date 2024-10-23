let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

let socket = new WebSocket('wss://chat-app-608h.onrender.com/'); // Update with your server URL
let token = ''; // Store JWT token

// Cache DOM elements for efficiency
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator'); // Ensure you have an element for the typing indicator
const userListContainer = document.getElementById('user-list'); // Element to display online users

const onlineUsers = new Set(); // To track online users

// Retrieve token from localStorage if available
token = localStorage.getItem('token');
if (token) {
    sendToken(token);
}

// Send JWT token after login for authentication
function sendToken(token) {
    if (token) {
        socket.send(JSON.stringify({ type: 'AUTH', token }));
    }
}

// Example login function to retrieve and store token
function login(username, password) {
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            token = data.token; // Set token
            localStorage.setItem('token', token); // Store it for persistence
            sendToken(token); // Send it to WebSocket server
        } else {
            console.error('Login failed');
        }
    });
}

// Handle WebSocket incoming messages
socket.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data); // Parse incoming message
        handleIncomingMessage(message);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

// Process incoming messages
function handleIncomingMessage(message) {
    if (message.type === 'ACK' && message.id) {
        markMessageAsSent(message.id); // Mark message as successfully sent
    } else if (message.type === 'USER_CONNECTED') {
        addUserToList(message.username);
    } else if (message.type === 'USER_DISCONNECTED') {
        removeUserFromList(message.username);
    } else if (message.type === 'TYPING') {
        showTypingIndicator(message.from);
    } else {
        displayMessage(message);
    }
}

// Display a message in the chat
function displayMessage({ type, from, content }) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = type === 'PRIVATE_MESSAGE' 
        ? `Private from ${from}: ${content}` 
        : `${from}: ${content}`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Function to display a pending message
function displayPendingMessage({ content, id }) {
    const pendingMessageDiv = document.createElement('div');
    pendingMessageDiv.textContent = `Sending: ${content} (ID: ${id})`;
    pendingMessageDiv.className = 'pending-message'; // Add a class for styling
    messagesContainer.appendChild(pendingMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Mark a message as sent
function markMessageAsSent(id) {
    const pendingMessageDiv = document.querySelector(`.pending-message[id="${id}"]`);
    if (pendingMessageDiv) {
        pendingMessageDiv.textContent = `Sent: ${pendingMessageDiv.textContent}`;
        pendingMessageDiv.classList.remove('pending-message'); // Remove pending class
    }
}

// Generate a unique message ID
function generateMessageId() {
    return Date.now().toString(); // Simple unique ID based on timestamp
}

// Send a message to the WebSocket server
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const messageObj = {
        type: 'PUBLIC_MESSAGE',
        content: message,
        id: generateMessageId() // Assign a unique message ID
    };

    displayPendingMessage(messageObj); // Show message as pending
    socket.send(JSON.stringify(messageObj)); // Send message
    messageInput.value = ''; // Clear input
}

// Show typing indicator
function showTypingIndicator(username) {
    typingIndicator.textContent = `${username} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = ''; // Clear after 2 seconds
    }, 2000);
}

// Event listeners for message sending
sendButton.onclick = sendMessage;
messageInput.addEventListener('input', () => {
    socket.send(JSON.stringify({ type: 'TYPING', from: 'user1' })); // Replace 'user1' with the actual username
});
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

// WebSocket error handling
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('WebSocket error. Check console for details.');
};

// Handle WebSocket connection closure with reconnection logic
socket.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        reconnectAttempts++;
        setTimeout(() => {
            socket = new WebSocket('wss://chat-app-608h.onrender.com/');
        }, 2000); // Reconnect after 2 seconds
    } else {
        alert('Failed to reconnect to the server.');
    }
};

// Functions to manage user status updates
function addUserToList(username) {
    onlineUsers.add(username); // Add user to the set
    updateUserListDisplay(); // Update UI
}

function removeUserFromList(username) {
    onlineUsers.delete(username); // Remove user from the set
    updateUserListDisplay(); // Update UI
}

let loggedInUser = ''; // Variable to store the logged-in username

// Event listener for login
document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (response.ok) {
        const data = await response.json();
        token = data.token;
        loggedInUser = username; // Store the logged-in username
        socket.send(token); // Send token to WebSocket server
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        displayLoggedInUser(loggedInUser); // Update UI to show logged-in user
        displayFeedback('Login successful!');
    } else {
        displayFeedback('Login failed. Please check your credentials.');
    }
});

// Function to display the logged-in user
function displayLoggedInUser(username) {
    const loggedInDisplay = document.getElementById('logged-in-user');
    loggedInDisplay.textContent = `Logged in as: ${username}`;
}



// Update the displayed list of online users
function updateUserListDisplay() {
    userListContainer.innerHTML = ''; // Clear existing list
    onlineUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user; // Display the username
        userListContainer.appendChild(userDiv);
    });
}

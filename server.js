const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MySQL connection
const sequelize = new Sequelize('chat-app', 'avnadmin', 'AVNS_4c3BtByux_Zrt-LiW6-', {
    host: 'mysql-1b23a9b5-poizen.h.aivencloud.com',
    dialect: 'mysql',
    port: 22330,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected');
    } catch (error) {
        console.error('MySQL connection error:', error);
    }
})();

// Define a User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Sync the model with the database
(async () => {
    await User.sync();
})();

let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    ws.on('message', (message) => {
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
    });
});

app.use(express.static('public'));
app.use(express.json()); // For parsing application/json

// User registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await User.create({ username, password: hashedPassword });
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(400).send('Error registering user: ' + err.message);
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid username or password');
        }

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Error logging in: ' + err.message);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

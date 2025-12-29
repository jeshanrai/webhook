// Import Express.js
const express = require('express');

// Create app
const app = express();
app.use(express.json());

// Port & Verify Token
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// 🔹 Webhook verification (GET)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Messenger Webhook Verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 🔹 Receive Messenger messages (POST)
app.post('/', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          const senderId = event.sender.id;
          const messageText = event.message.text;

          console.log('📩 New Messenger Message');
          console.log('From:', senderId);
          console.log('Message:', messageText);
        }
      });
    });

    return res.status(200).send('EVENT_RECEIVED');
  }

  res.sendStatus(404);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Messenger Webhook running on port ${PORT}`);
});

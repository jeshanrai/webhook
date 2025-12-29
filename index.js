// Import Express.js
const express = require('express');
require('dotenv').config();

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests (Webhook Verification)
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✓ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.error('✗ Webhook verification failed - invalid token');
    res.status(403).end();
  }
});

// Alternative GET route for /webhook/messenger
app.get('/webhook/messenger', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✓ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.error('✗ Webhook verification failed - invalid token');
    res.status(403).end();
  }
});

// Route for POST requests (Receive Messages)
app.post('/', (req, res) => {
  const body = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Check if this is a page event
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        const sender_id = event.sender.id;

        // Handle text messages
        if (event.message && event.message.text) {
          const message_text = event.message.text;
          const message_id = event.message.mid;

          console.log(`\n[${timestamp}] New Message Received`);
          console.log(`Sender ID: ${sender_id}`);
          console.log(`Message ID: ${message_id}`);
          console.log(`Message Text: ${message_text}`);
          console.log('---\n');
        }

        // Handle postback events
        if (event.postback) {
          const postback_payload = event.postback.payload;
          console.log(`\n[${timestamp}] Postback from ${sender_id}: ${postback_payload}\n`);
        }

        // Handle delivery confirmations
        if (event.delivery) {
          console.log(`\n[${timestamp}] Delivery confirmed for ${sender_id}\n`);
        }

        // Handle read receipts
        if (event.read) {
          console.log(`\n[${timestamp}] Message read by ${sender_id}\n`);
        }
      });
    });

    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

// Alternative POST route for /webhook/messenger
app.post('/webhook/messenger', (req, res) => {
  const body = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Check if this is a page event
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        const sender_id = event.sender.id;

        // Handle text messages
        if (event.message && event.message.text) {
          const message_text = event.message.text;
          const message_id = event.message.mid;

          console.log(`\n[${timestamp}] New Message Received`);
          console.log(`Sender ID: ${sender_id}`);
          console.log(`Message ID: ${message_id}`);
          console.log(`Message Text: ${message_text}`);
          console.log('---\n');
        }

        // Handle postback events
        if (event.postback) {
          const postback_payload = event.postback.payload;
          console.log(`\n[${timestamp}] Postback from ${sender_id}: ${postback_payload}\n`);
        }

        // Handle delivery confirmations
        if (event.delivery) {
          console.log(`\n[${timestamp}] Delivery confirmed for ${sender_id}\n`);
        }

        // Handle read receipts
        if (event.read) {
          console.log(`\n[${timestamp}] Message read by ${sender_id}\n`);
        }
      });
    });

    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}`);
  console.log(`Webhook endpoints: / and /webhook/messenger`);
  console.log(`Verify token: ${verifyToken ? verifyToken.substring(0, 5) + '...' : 'NOT SET'}\n`);
});

require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token_here';

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Facebook Messenger Webhook Server is running');
});

// Webhook GET endpoint for verification
app.get('/webhook/messenger', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the token matches the one you set
  if (mode && token === VERIFY_TOKEN) {
    if (mode === 'subscribe') {
      console.log('✓ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    console.error('✗ Webhook verification failed - invalid token or mode');
    res.sendStatus(403);
  }
});

// Webhook POST endpoint for receiving messages
app.post('/webhook/messenger', (req, res) => {
  const body = req.body;

  // Check if this is a page subscription confirmation
  if (body.object === 'page') {
    // Process each entry
    body.entry.forEach((entry) => {
      // Get the message events from the entry
      const messaging_events = entry.messaging;

      messaging_events.forEach((event) => {
        const sender_id = event.sender.id;
        const recipient_id = event.recipient.id;

        // Handle message events
        if (event.message) {
          const message_text = event.message.text;
          const message_id = event.message.mid;
          const timestamp = event.timestamp;

          console.log('\n--- New Message Received ---');
          console.log(`Sender ID: ${sender_id}`);
          console.log(`Message ID: ${message_id}`);
          console.log(`Message Text: ${message_text}`);
          console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
          console.log('----------------------------\n');
        }

        // Handle postback events (buttons, quick replies, etc.)
        if (event.postback) {
          const postback_payload = event.postback.payload;
          console.log(`\nPostback received from ${sender_id}: ${postback_payload}\n`);
        }

        // Handle delivery confirmation
        if (event.delivery) {
          console.log(`Message delivered to ${sender_id}`);
        }

        // Handle read receipt
        if (event.read) {
          console.log(`Message read by ${sender_id}`);
        }
      });
    });

    // Return a 200 OK status to acknowledge receipt
    res.status(200).send('ok');
  } else {
    res.sendStatus(404);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Webhook server running on port ${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhook/messenger`);
  console.log(`🔐 Using verify token: ${VERIFY_TOKEN.substring(0, 5)}...`);
  console.log('\nWaiting for messages...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

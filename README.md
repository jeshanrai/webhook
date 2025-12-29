# Facebook Messenger Webhook Receiver

A simple Node.js Express backend that receives messages from Facebook Messenger via Meta Platform webhooks.

## Features

- ✅ Handles webhook verification (hub.mode, hub.verify_token, hub.challenge)
- ✅ Receives and logs Messenger messages with sender ID and text
- ✅ Handles postback events, delivery confirmations, and read receipts
- ✅ Uses environment variables for secure token management
- ✅ HTTPS compatible for Render deployment
- ✅ Express.json() middleware for request parsing

## Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- A Facebook Page
- A Meta App with Messenger product enabled
- A public URL (for production/testing with Meta webhooks)

## Installation

1. Clone or download this project:
```bash
cd WEBHOOK
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and set your verify token:
```env
PORT=3000
VERIFY_TOKEN=your_secure_verify_token_here
```

## Local Development

Run the server locally:
```bash
npm start
```

You should see:
```
🚀 Webhook server running on port 3000
📍 Webhook endpoint: http://localhost:3000/webhook/messenger
🔐 Using verify token: your_...

Waiting for messages...
```

## Setting Up with Meta Webhooks

### 1. Configure Webhooks in Facebook App

1. Go to your [Meta App Dashboard](https://developers.facebook.com/apps)
2. Select your app → **Messenger** → **Settings**
3. Under **Webhooks**, click **Add Callback URL**

### 2. Add Callback URL

- **Callback URL**: `https://your-domain.com/webhook/messenger` (must be HTTPS)
- **Verify Token**: Match the `VERIFY_TOKEN` from your `.env` file
- Click **Verify and Save**

Meta will send a GET request with `hub.mode=subscribe`, `hub.verify_token`, and `hub.challenge`.
The server will verify the token and return the challenge to confirm the webhook.

### 3. Subscribe to Message Events

After webhook verification, subscribe to the following webhook fields:
- `messages` - Receive text messages
- `messaging_postbacks` - Receive button/quick reply actions
- `message_deliveries` - Track message delivery
- `message_reads` - Track message reads

## Deployment on Render

### 1. Prepare Your Project

Ensure you have:
- `package.json` ✓
- `.env.example` ✓
- `index.js` ✓

### 2. Deploy to Render

1. Push your code to a GitHub repository
2. Go to [render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variable:
   - **Key**: `VERIFY_TOKEN`
   - **Value**: Your secure token
7. Deploy!

Render will provide your public URL: `https://your-app-name.onrender.com`

### 3. Update Meta Webhook URL

Update the webhook callback URL in Facebook App settings to:
```
https://your-app-name.onrender.com/webhook/messenger
```

## Testing Locally with Ngrok (Optional)

To test webhooks locally with a public URL:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the ngrok URL (e.g., https://xxx.ngrok.io) as your callback URL in Meta settings
```

## Project Structure

```
WEBHOOK/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## API Endpoints

### GET /webhook/messenger
Webhook verification endpoint. Called by Meta to verify your webhook.

**Query Parameters:**
- `hub.mode` - Should be "subscribe"
- `hub.verify_token` - Your verify token
- `hub.challenge` - Random challenge string to return

**Response:**
- `200 OK`: Returns the challenge string (if token matches)
- `403 Forbidden`: If token doesn't match

### POST /webhook/messenger
Receives message events from Facebook Messenger.

**Expected Body Format:**
```json
{
  "object": "page",
  "entry": [
    {
      "messaging": [
        {
          "sender": { "id": "USER_ID" },
          "recipient": { "id": "PAGE_ID" },
          "message": {
            "mid": "MESSAGE_ID",
            "text": "Hello!",
            "timestamp": 1234567890
          }
        }
      ]
    }
  ]
}
```

## Console Output Example

When a message is received:
```
--- New Message Received ---
Sender ID: 123456789
Message ID: m_msg_123
Message Text: Hello, bot!
Timestamp: 2025-12-29T10:30:45.000Z
----------------------------
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `VERIFY_TOKEN` | your_verify_token_here | Token for webhook verification (set a strong, random value) |

## Common Issues

### "Webhook verification failed"
- Verify token in `.env` doesn't match Meta settings
- Check for typos in the callback URL
- Ensure the URL is HTTPS (required by Meta)

### "Messages not being received"
- Webhook subscription may have failed
- Check if all required webhook fields are subscribed in Meta settings
- Verify the callback URL is still accessible

### Port already in use
Change the PORT in `.env` or:
```bash
PORT=3001 npm start
```

## Security Notes

- **Never** commit `.env` to git (add it to `.gitignore`)
- Use a strong, random verify token
- Always use HTTPS in production
- The server logs sender IDs and messages to console (consider logging service for production)

## Next Steps

- Add authentication to send messages back to users
- Implement message templates or structured content
- Add database to store messages
- Create response handlers for different message types
- Implement NLP/AI for intelligent responses

## License

MIT

## Support

For issues with:
- **Meta Webhooks**: See [Meta Messenger Documentation](https://developers.facebook.com/docs/messenger-platform/webhooks)
- **Express**: See [Express.js Documentation](https://expressjs.com/)
- **Render Deployment**: See [Render Documentation](https://render.com/docs)
# webhook

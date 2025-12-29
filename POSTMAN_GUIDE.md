# Postman Testing Guide - Facebook Messenger Webhook

## Environment Variables Setup
Set these variables in Postman:
```json
{
  "base_url": "localhost:3000",
  "verify_token": "your_verify_token_here",
  "challenge": "RANDOM_CHALLENGE_123"
}
```

---

## 1. WEBHOOK VERIFICATION (GET Request)

### Endpoint
```
GET http://{{base_url}}/webhook/messenger?hub.mode=subscribe&hub.verify_token={{verify_token}}&hub.challenge={{challenge}}
```

### Query Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| hub.mode | subscribe | Request type |
| hub.verify_token | {{verify_token}} | Token from your .env |
| hub.challenge | {{challenge}} | Random challenge string |

### Headers
```
Content-Type: application/json
```

### Expected Response
- **Status Code:** 200
- **Body:** `RANDOM_CHALLENGE_123` (echoes the challenge)

### Success Example
```
Status: 200 OK
Response Body: RANDOM_CHALLENGE_123
```

---

## 2. RECEIVE SINGLE MESSAGE (POST Request)

### Endpoint
```
POST http://{{base_url}}/webhook/messenger
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789",
      "time": 1671234567890,
      "messaging": [
        {
          "sender": {
            "id": "987654321"
          },
          "recipient": {
            "id": "123456789"
          },
          "timestamp": 1671234567890,
          "message": {
            "mid": "m_1234567890",
            "text": "Hello! This is a test message."
          }
        }
      ]
    }
  ]
}
```

### Expected Response
- **Status Code:** 200
- **Body:** `EVENT_RECEIVED`

### Console Output
```
📩 New Messenger Message
From: 987654321
Message: Hello! This is a test message.
```

---

## 3. RECEIVE MULTIPLE MESSAGES (POST Request)

### Endpoint
```
POST http://{{base_url}}/webhook/messenger
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789",
      "time": 1671234567890,
      "messaging": [
        {
          "sender": {
            "id": "user-001"
          },
          "recipient": {
            "id": "page-123"
          },
          "timestamp": 1671234567890,
          "message": {
            "mid": "m_001",
            "text": "First message"
          }
        },
        {
          "sender": {
            "id": "user-002"
          },
          "recipient": {
            "id": "page-123"
          },
          "timestamp": 1671234567891,
          "message": {
            "mid": "m_002",
            "text": "Second message from another user"
          }
        },
        {
          "sender": {
            "id": "user-001"
          },
          "recipient": {
            "id": "page-123"
          },
          "timestamp": 1671234567892,
          "message": {
            "mid": "m_003",
            "text": "Third message, back to first user"
          }
        }
      ]
    }
  ]
}
```

### Expected Response
- **Status Code:** 200
- **Body:** `EVENT_RECEIVED`

### Console Output
```
📩 New Messenger Message
From: user-001
Message: First message

📩 New Messenger Message
From: user-002
Message: Second message from another user

📩 New Messenger Message
From: user-001
Message: Third message, back to first user
```

---

## 4. INVALID REQUEST - Wrong Token (GET)

### Endpoint
```
GET http://{{base_url}}/webhook/messenger?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge={{challenge}}
```

### Expected Response
- **Status Code:** 403 (Forbidden)
- **Body:** Empty

---

## 5. INVALID REQUEST - Wrong Object Type (POST)

### Endpoint
```
POST http://{{base_url}}/webhook/messenger
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "object": "user",
  "entry": [
    {
      "id": "123456789",
      "time": 1671234567890,
      "messaging": []
    }
  ]
}
```

### Expected Response
- **Status Code:** 404 (Not Found)
- **Body:** Empty

---

## 6. MESSAGE WITH ATTACHMENT

### Endpoint
```
POST http://{{base_url}}/webhook/messenger
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789",
      "time": 1671234567890,
      "messaging": [
        {
          "sender": {
            "id": "user-123"
          },
          "recipient": {
            "id": "page-456"
          },
          "timestamp": 1671234567890,
          "message": {
            "mid": "m_attachment_001",
            "attachments": [
              {
                "type": "image",
                "payload": {
                  "url": "https://example.com/image.jpg"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Note
This will not log a message (since `event.message.text` is undefined), but the webhook will still respond with 200 EVENT_RECEIVED.

---

## 7. ROOT ENDPOINT (/) vs DEDICATED ENDPOINT (/webhook/messenger)

Both endpoints work identically:

**GET Verification:**
```
GET http://localhost:3000/?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test
GET http://localhost:3000/webhook/messenger?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test
```

**POST Message:**
```
POST http://localhost:3000/
POST http://localhost:3000/webhook/messenger
```

---

## Postman Test Scripts (Post-Response)

### Verify Status Code
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### Verify Response Content
```javascript
pm.test("Response is EVENT_RECEIVED", function () {
    pm.expect(pm.response.text()).to.equal("EVENT_RECEIVED");
});
```

### Verify Verification Challenge
```javascript
pm.test("Challenge echoed correctly", function () {
    pm.expect(pm.response.text()).to.equal(pm.environment.get('challenge'));
});
```

### Log Request/Response
```javascript
console.log("Request Body:", JSON.stringify(pm.request.body.raw, null, 2));
console.log("Response:", pm.response.text());
```

---

## Quick Testing Checklist

- [ ] Set `verify_token` in Postman environment to match .env
- [ ] Start server: `npm start`
- [ ] Test GET verification endpoint
- [ ] Test POST single message
- [ ] Test POST multiple messages
- [ ] Test wrong token (should return 403)
- [ ] Test wrong object type (should return 404)
- [ ] Check server console for log output
- [ ] Verify response times and status codes

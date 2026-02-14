# 🎉 FREE WhatsApp Integration for Websites

**100% Free • No API Costs • Unlimited Messages**

A complete solution for WhatsApp-based phone authentication and auction notifications using open-source technologies.

## ✨ Features

- 📱 **Phone Authentication**: OTP verification via WhatsApp
- 🔔 **Auction Notifications**: Send instant alerts to all users
- 💰 **Completely FREE**: No API keys, no monthly fees, no message limits
- ⚡ **Open Source**: Built with Baileys library
- 🗄️ **Self-Hosted**: Full control over your data
- 🎨 **Modern UI**: Beautiful React components

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

1. **Clone or navigate to the project**
```bash
cd whatsapp-integration
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment**
```bash
cd ../backend
cp .env.example .env
# Edit .env if needed (default values work fine)
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm start
```

The server will start on `http://localhost:3001`

2. **Start the frontend** (in a new terminal)
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

3. **Connect WhatsApp**
   - Go to the Admin panel in the app
   - Scan the QR code with WhatsApp (Settings → Linked Devices)
   - Once connected, you're ready to go!

## 📖 How It Works

### Phone Authentication Flow

1. User enters phone number
2. System generates 6-digit OTP
3. OTP sent via WhatsApp (FREE!)
4. User enters OTP to verify
5. Account created/verified

### Auction Notification Flow

1. Admin creates auction details
2. System fetches all opted-in users
3. Sends WhatsApp message to each user
4. Logs delivery status
5. Users receive instant notification

## 🔌 API Endpoints

### Authentication

**Send OTP**
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "1234567890"
}
```

**Send Specific OTP (integration mode)**
```http
POST /api/auth/send-otp-direct
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "otp": "123456"
}
```

**Verify OTP**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "otp": "123456"
}
```

### Notifications

**Send to All Users**
```http
POST /api/auctions/notify
Content-Type: application/json

{
  "auctionId": 1,
  "title": "Vintage Car",
  "startingPrice": 5000,
  "startTime": "2026-02-15 10:00",
  "location": "Online",
  "url": "https://example.com/auction/1"
}
```

**Send to Single User**
```http
POST /api/auctions/notify-single
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "auctionId": 1,
  "title": "Vintage Car",
  "startingPrice": 5000,
  "startTime": "2026-02-15 10:00",
  "url": "https://example.com/auction/1"
}
```

## 📁 Project Structure

```
whatsapp-integration/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express server
│   │   ├── whatsapp.service.js # WhatsApp integration
│   │   └── database.service.js # SQLite database
│   ├── auth_info/              # WhatsApp session (auto-generated)
│   ├── data/                   # SQLite database (auto-generated)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PhoneAuth.jsx      # Phone authentication UI
    │   │   └── AuctionNotifier.jsx # Admin notification panel
    │   ├── App.jsx
    │   └── App.css
    └── package.json
```

## 💡 Integration with Your Website

### Option 1: Use as Microservice

Keep the backend running and make API calls from your existing website:

```javascript
// Send OTP
const response = await fetch('http://localhost:3001/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '1234567890' })
});
```

### Option 2: Embed React Components

Copy the React components into your existing React app:

```javascript
import PhoneAuth from './components/PhoneAuth';

function SignupPage() {
  return <PhoneAuth onSuccess={(user) => console.log('Verified!', user)} />;
}
```

### Option 3: Copy Backend Code

Integrate the WhatsApp service directly into your Node.js backend:

```javascript
import whatsappService from './whatsapp.service.js';

// In your signup route
await whatsappService.sendOTP(phoneNumber, otp);
```

## 🔒 Security Best Practices

1. **Rate Limiting**: Add rate limiting to prevent OTP spam
2. **Environment Variables**: Never commit `.env` files
3. **HTTPS**: Use HTTPS in production
4. **Phone Validation**: Validate phone numbers before sending
5. **OTP Expiry**: OTPs expire after 5 minutes (configurable)

## ⚠️ Important Notes

- **WhatsApp Connection**: Keep the backend running to maintain WhatsApp connection
- **QR Code**: You'll need to scan QR code once when first connecting
- **Session Persistence**: Session is saved in `auth_info/` folder
- **Unofficial API**: This uses Baileys, an unofficial WhatsApp library
- **Terms of Service**: Use responsibly and avoid spam

## 🎯 Use Cases

- ✅ User signup verification
- ✅ Two-factor authentication
- ✅ Auction/event notifications
- ✅ Order confirmations
- ✅ Appointment reminders
- ✅ Flash sale alerts

## 🆚 Why This Solution?

| Feature | This Solution | Twilio | Official API |
|---------|--------------|--------|--------------|
| Cost | **$0** | ~$0.005/msg | ~$0.01/msg |
| Setup Time | 5 minutes | 30 minutes | 2-3 days |
| Message Limit | Unlimited | Pay per use | 1,000 free/month |
| Verification | None | Phone required | Business verification |
| Open Source | ✅ Yes | ❌ No | ❌ No |

## 🛠️ Troubleshooting

**WhatsApp won't connect?**
- Make sure you're using Node.js v18+
- Delete `auth_info/` folder and restart
- Check if WhatsApp Web works in your browser

**OTP not sending?**
- Verify WhatsApp is connected (check status endpoint)
- Check phone number format (include country code)
- Look at server logs for errors

**Messages delayed?**
- There's a 1-second delay between bulk messages to avoid rate limiting
- This is configurable in `whatsapp.service.js`

## 📝 License

MIT License - Free to use for personal and commercial projects

## 🙏 Credits

Built with:
- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- Express.js - Backend framework
- React - Frontend framework
- SQLite - Database

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Made with ❤️ for the developer community**

**Cost: $0.00 forever! 🎉**

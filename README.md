# Animo Meet - Backend

A robust Node.js backend server for the Animo Meet video conferencing application. Built with Express.js and Socket.IO, this server handles real-time WebRTC signaling, user authentication, meeting management, and persistent data storage using MongoDB.

**Note**: You can visit the Frontend repository [here](https://github.com/animeshtxt/Animo-Meet-Frontend).

## 🚀 Features

### Core Functionality

- **WebRTC Signaling Server**: Facilitates peer-to-peer connection establishment using Socket.IO
- **Real-time Communication**: Bidirectional event-based communication for video calls and chat
- **User Authentication**: Secure user registration and login with bcrypt password hashing
- **Meeting Management**: Create, join, and manage video conference rooms
- **Token-based Authorization**: JWT-like token validation for secure API access

### Technical Features

- **RESTful API**: Well-structured API endpoints for user and meeting operations
- **MongoDB Integration**: Persistent storage for users and meeting data
- **CORS Configuration**: Secure cross-origin resource sharing with environment-based origins
- **Socket.IO Events**: Real-time event handling for WebRTC signaling (offer, answer, ICE candidates)
- **Environment-based Configuration**: Separate development and production configurations
- **Custom Logger**: Structured logging utility for debugging and monitoring
- **Error Handling**: Centralized error handling and validation

## �🛠️ Tech Stack

### Backend Framework

- **Node.js** - JavaScript runtime environment
- **Express.js 4.21.2** - Fast, minimalist web framework

### Real-time Communication

- **Socket.IO 4.8.1** - Real-time bidirectional event-based communication
- **WebRTC Signaling** - Peer connection establishment and ICE candidate exchange

### Database

- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose 8.12.1** - Elegant MongoDB object modeling

### Security & Authentication

- **bcrypt 5.1.1** - Password hashing and salting
- **crypto 1.0.1** - Token generation and cryptographic operations
- **CORS 2.8.5** - Cross-origin resource sharing middleware

### Utilities

- **dotenv 16.4.7** - Environment variable management
- **http-status 2.1.0** - HTTP status code constants
- **nodemon** - Development server with auto-restart

### Deployment

- **PM2** - Production process manager
- **AWS EC2** - Cloud hosting with Nginx reverse proxy (https://animo-meet-backend.animesh-kgpian.duckdns.org/)
- **Let's Encrypt SSL** - HTTPS encryption
- **Render** - Cloud hosting (https://animo-meet-backend.onrender.com/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v6.0 or higher) - Local installation or MongoDB Atlas account
- **PM2** (optional, for production deployment)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/animeshtxt/Animo-Meet-Backend.git
cd Animo-Meet-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database URLs
DEVELOPMENT_DB_URL=<your local db connection string>
PRODUCTION_DB_URL=<your production db connection string>

# Authentication Secret
SECRET_KEY=your-secret-key-here
```

> **Important**: Replace placeholder values with your actual configuration.

### 4. Start MongoDB

Ensure MongoDB is running on your local machine or configure MongoDB Atlas connection string.

```bash
# For local MongoDB
mongod
```

### 5. Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:8080`

## 📦 Available Scripts

| Command        | Description                                          |
| -------------- | ---------------------------------------------------- |
| `npm run dev`  | Start development server with nodemon (auto-restart) |
| `npm start`    | Start production server                              |
| `npm run prod` | Start server with PM2 process manager                |

## 🌐 API Endpoints

### User Routes (`/api/v1/users`)

| Method | Endpoint       | Description       | Auth Required | Request Body                   | Response                             |
| ------ | -------------- | ----------------- | ------------- | ------------------------------ | ------------------------------------ |
| POST   | `/login`       | User login        | No            | `{ username, password }`       | `{ token, message, username, name }` |
| POST   | `/signup`      | User registration | No            | `{ name, username, password }` | `{ message }`                        |
| GET    | `/verify-user` | Verify user token | Yes           | -                              | `{ message, name, username, time }`  |

### Meeting Routes (`/api/v1/meeting`)

| Method | Endpoint                   | Description              | Auth Required | Query/Params                    | Response               |
| ------ | -------------------------- | ------------------------ | ------------- | ------------------------------- | ---------------------- |
| GET    | `/check-code/:meetingCode` | Create meeting with code | Yes           | `meetingCode` (param)           | `{ message }`          |
| GET    | `/check-meet/:meetingCode` | Check if meeting exists  | No            | `meetingCode` (param)           | `{ message }`          |
| GET    | `/check-host`              | Check if user is host    | No            | `username, meetingCode` (query) | `{ message }`          |
| GET    | `/prev-meets/:username`    | Get previous meetings    | Yes           | `username` (param)              | Array of meeting codes |

### Health Check

| Method | Endpoint | Description         | Response  |
| ------ | -------- | ------------------- | --------- |
| GET    | `/`      | Server health check | I am home |

## �️ Authentication Middleware

### Overview

The application uses a custom token-based authentication system implemented through the `validateToken` middleware. This middleware secures protected routes by validating user tokens stored in the database.

### Token Lifecycle

1. **Generation**: Token created during login using `crypto.randomBytes(20).toString('hex')`
2. **Storage**: Token saved in user's MongoDB document
3. **Transmission**: Client sends token in `Authorization: Bearer <token>` header
4. **Validation**: Middleware verifies token exists in database
5. **Access**: User object attached to `req.user` for route handlers

### Middleware Implementation

**Location**: `src/middlewares/validateToken.js`

**Key Features**:

- Extracts Bearer token from Authorization header
- Validates token against MongoDB user collection
- Attaches authenticated user to request object
- Returns appropriate HTTP status codes (401, 500)

### Protected Routes

Routes that require the `validateToken` middleware:

| Route                                     | Method | Purpose                         |
| ----------------------------------------- | ------ | ------------------------------- |
| `/api/v1/users/verify-user`               | GET    | Validate current user session   |
| `/api/v1/meeting/check-code/:meetingCode` | GET    | Create new meeting room         |
| `/api/v1/meeting/prev-meets/:username`    | GET    | Retrieve user's meeting history |

### Usage Example

**Backend Route Definition**:

```javascript
import { validateToken } from "../middlewares/validateToken.js";

// Apply middleware to protected route
router.route("/verify-user").get(validateToken, verifyUser);
```

**Frontend API Call**:

```javascript
// After login, store token
const { token } = await loginResponse.json();
localStorage.setItem("token", token);

// Use token in protected requests
fetch("/api/v1/users/verify-user", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

### Error Handling

| Status | Message                      | Cause                                     | Solution                   |
| ------ | ---------------------------- | ----------------------------------------- | -------------------------- |
| 401    | `no token provided`          | Missing or malformed Authorization header | Include valid Bearer token |
| 401    | `Invalid token, login again` | Token not found in database               | Re-authenticate user       |
| 500    | Error details                | Database or server error                  | Check server logs          |

## 🔌 Socket.IO Events

### Client → Server Events

| Event          | Description                           | Payload                                                                                                    |
| -------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `join-call`    | User joins a meeting room             | Object: `{ roomID, username, name, audioEnabled, audioAvailable, videoEnabled, videoAvailable }`           |
| `signal`       | WebRTC signaling for peer connections | Parameters: `(toId, message)` where `toId` is target socket ID and `message` contains WebRTC data          |
| `toggle-media` | User toggles their audio/video        | Object: `{ roomId, peerVideoEnabled, peerVideoAvailable, peerAudioEnabled, peerAudioAvailable }`           |
| `chat-message` | User sends a chat message             | Parameters: `(sender, data, time)` where `sender` is username, `data` is message text, `time` is timestamp |
| `disconnect`   | User disconnects from server          | Automatic event (no payload)                                                                               |

### Server → Client Events

| Event               | Description                       | Payload                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user-joined`       | Broadcast when user joins room    | Object: `{ id, clients, username, name, usernamesMap, namesMap, peerAudioEnabled, peerAudioAvailable, peerVideoEnabled, peerVideoAvailable }` <br>- `id`: Socket ID of joined user<br>- `clients`: Array of all socket IDs in room<br>- `usernamesMap`: Object mapping socket IDs to usernames<br>- `namesMap`: Object mapping socket IDs to display names |
| `user-left`         | Broadcast when user leaves room   | Parameters: `(socketId, username)` where `socketId` is the disconnected user's socket ID                                                                                                                                                                                                                                                                   |
| `signal`            | Forward WebRTC signaling data     | Parameters: `(fromId, message)` where `fromId` is sender's socket ID                                                                                                                                                                                                                                                                                       |
| `user-media-update` | Broadcast when user toggles media | Object: `{ userId, peerVideoEnabled, peerVideoAvailable, peerAudioEnabled, peerAudioAvailable }` <br>Note: Sent to all room members except the sender                                                                                                                                                                                                      |
| `chat-message`      | Broadcast chat message to room    | Parameters: `(sender, data, time, socketId)` where `socketId` is sender's socket ID                                                                                                                                                                                                                                                                        |

## 🏗️ Project Structure

```
Animo-Meet-Backend/
├── src/
│   ├── controllers/           # Request handlers and business logic
│   │   ├── user.controller.js      # User authentication logic
│   │   ├── meeting.controller.js   # Meeting management logic
│   │   └── socketManager.js        # Socket.IO event handlers
│   ├── models/                # MongoDB schemas
│   │   ├── user.model.js           # User schema
│   │   └── meeting.model.js        # Meeting schema
│   ├── routes/                # API route definitions
│   │   ├── users.routes.js         # User endpoints
│   │   └── meeting.routes.js       # Meeting endpoints
│   ├── middlewares/           # Custom middleware
│   │   └── validateToken.js        # Token validation middleware
│   ├── utils/                 # Utility functions
│   │   └── logger.js               # Custom logger
│   └── app.js                 # Application entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json               # Project dependencies
└── README.md                  # Documentation
```

## 🔐 Environment Variables

| Variable             | Description                         | Example                                |
| -------------------- | ----------------------------------- | -------------------------------------- |
| `PORT`               | Server port number                  | `8080`                                 |
| `NODE_ENV`           | Environment mode                    | `development` or `production`          |
| `FRONTEND_URL`       | Frontend application URL (for CORS) | `http://localhost:5173`                |
| `DEVELOPMENT_DB_URL` | MongoDB connection string (dev)     | `mongodb://localhost:27017/animo-meet` |
| `PRODUCTION_DB_URL`  | MongoDB connection string (prod)    | `mongodb+srv://...`                    |
| `SECRET_KEY`         | Secret key for token generation     | `your-secret-key`                      |

## 🚀 Deployment

### Production Deployment on AWS EC2

1. **Build and Deploy**

```bash
# 1. Install PM2 globally

npm install pm2 -g

# 2. Start your application & optionally specify a name

pm2 start src/app.js --name "animo-meet-backend"

# 3. Generate startup script (this outputs a command)

pm2 startup

# 4. IMPORTANT: Copy and execute the command that pm2 startup outputs

# It will look something like this (example for systemd):
# Replace 'ubuntu' with your actual Linux username

# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 5. Save the PM2 process list

pm2 save

# 6. Enable PM2 to start on boot (if using systemd)
# Replace 'ubuntu' with your actual Linux username

sudo systemctl enable pm2-ubuntu

```

2. **Configure Nginx** (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Environment Setup for Production

```env
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.com
PRODUCTION_DB_URL=mongodb+srv://...
SECRET_KEY=strong-production-secret
```

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Environment-based CORS configuration
- ✅ Token-based authentication
- ✅ Input validation and sanitization
- ✅ HTTPS encryption in production
- ✅ Secure MongoDB connection strings

## 🧪 Testing

### Manual API Testing

Use tools like Postman or cURL to test API endpoints:

```bash
# Health check
curl http://localhost:8080/

# Register user (signup)
curl -X POST http://localhost:8080/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Verify user (requires token from login)
curl -X GET http://localhost:8080/api/v1/users/verify-user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Schema

### User Model

**File**: `src/models/user.model.js`

```javascript
const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, requierd: true }, // Note: typo in source code
  token: { type: String },
});
```

**Fields**:

- `name`: User's full name (required)
- `username`: Unique username for login (required, unique)
- `password`: Hashed password using bcrypt with 10 salt rounds (required)
- `token`: Authentication token generated with `crypto.randomBytes(20).toString('hex')`

### Meeting Model

**File**: `src/models/meeting.model.js`

```javascript
const MeetingSchema = new Schema({
  hostUsername: { type: String },
  coHostUsernames: { type: [String], default: [] },
  meetingCode: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  lastActive: {
    type: Date,
    default: Date.now,
    required: true,
    expires: "7d", // TTL index - document auto-deletes after 7 days
  },
  hostControls: {
    audioAllowed: { type: Boolean, default: true },
    videoAllowed: { type: Boolean, default: true },
    screenShareAllowed: { type: Boolean, default: true },
    hostPermissionRequired: { type: Boolean, default: true },
  },
});
```

**Fields**:

- `hostUsername`: Username of the meeting host
- `coHostUsernames`: Array of co-host usernames (default: empty array)
- `meetingCode`: Unique meeting identifier (required)
- `date`: Meeting creation timestamp (auto-generated)
- `lastActive`: Last activity timestamp with TTL index (expires after 7 days)
- `hostControls`: Object containing meeting permission settings
  - `audioAllowed`: Whether participants can use audio
  - `videoAllowed`: Whether participants can use video
  - `screenShareAllowed`: Whether screen sharing is permitted
  - `hostPermissionRequired`: Whether host approval is needed for actions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**

```bash
# Ensure MongoDB is running
sudo systemctl status mongod
# Or start MongoDB
sudo systemctl start mongod
```

**Port Already in Use**

```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

**CORS Errors**

- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS error messages

## 👨‍💻 Developer

Built with ❤️ by a passionate developer

---

**Live Deployment**:

- AWS EC2: https://animo-meet-backend.animesh-kgpian.duckdns.org/
- Render: https://animo-meet-backend.onrender.com/

**Note**: This is the backend server. Make sure to configure the frontend to connect to this server's URL.

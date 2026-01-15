# DevConnect Backend

A developer networking platform backend API that enables developers to connect, interact, and build professional relationships - think Tinder, but for developers!

## Features

- **User Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Profile Management**: Create and update developer profiles with skills, photos, and bio
- **Connection System**: Send, accept, or reject connection requests between developers
- **User Discovery**: Browse and discover other developers on the platform
- **Payment Integration**: Razorpay integration for premium features
- **Real-time Chat**: Instant messaging between connected users powered by Socket.io
- **CORS Enabled**: Ready for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Payment**: Razorpay
- **Validation**: Validator.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- Razorpay account (for payment features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devtinder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Routes

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Login user

### Profile
- `GET /profile/view` - View your profile
- `PATCH /profile/edit` - Update profile information

### Connection Requests
- `POST /request/send/:status/:userId` - Send connection request (interested/ignored)
- `POST /request/review/:status/:requestId` - Accept or reject connection request

### Users
- `GET /user/requests/received` - View received connection requests
- `GET /user/connections` - View accepted connections
- `GET /user/feed` - Discover new developers

### Chat
- `GET /chat/:targetUserId` - Get chat history with a specific user (Supports pagination: `?limit=20&before=TIMESTAMP`)

### Payments
- `POST /payment/create` - Create payment order (Placeholder)

## Socket.io Events

### Client Emits
- `joinChat` - Join a private chat room
  - Payload: `{ targetUserId: "..." }`
- `sendMessage` - Send a message to a friend
  - Payload: `{ targetUserId: "...", text: "..." }`

### Server Emits
- `messageReceived` - Received when a new message comes in
  - Payload: `{ text: "...", senderId: "...", senderName: "...", timestamp: ... }`

## User Schema

```javascript
{
  firstName: String (required, 2-50 chars),
  lastName: String,
  emailId: String (required, unique, validated),
  password: String (required, strong password, 6-100 chars),
  age: Number (min: 18),
  gender: String (Male/Female/Other),
  photoUrl: String (default avatar provided),
  about: String (max 80 chars),
  skills: [String]
}
```

## Chat Schema

```javascript
{
  participants: [{ type: ObjectId, ref: 'User' }],
  messages: [{
    senderId: { type: ObjectId, ref: 'User' },
    text: String,
    createdAt: Date
  }]
}
```


## Connection Request Schema

```javascript
{
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  status: String (ignored/interested/accepted/rejected)
}
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Strong password validation
- Email validation
- Protected routes with authentication middleware

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Local Development)
- `https://dev-connect-frontend-theta.vercel.app` (Production)

Allowed Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
Update the CORS settings in `src/app.js` if your frontend URL changes.

## Development

```bash
npm run dev  # Runs with nodemon for auto-reload
```

## Author

Prarthana Purohit

## License

ISC

# Needle Drop Backend

## Project Overview
The Needle Drop Backend powers the Needle Drop Vinyl Web Platform, providing essential APIs for user authentication, record management, messaging, and notifications. It integrates with third-party services like Spotify and AWS S3 to enhance functionality and user experience.

## Features
- **User Authentication**: Secure login and sign-up with JWT.
- **Record Management**: CRUD operations for vinyl records, with Spotify data integration.
- **Messaging System**: Start conversations, send messages, and mark messages as read.
- **Trade Management**: Initiate and confirm trades, and provide feedback.
- **Notifications**: Notify users about new listings, trade updates, and messages.
- **AWS S3 Integration**: Upload and manage user images.
- **Spotify Integration**: Fetch album and artist details.

## Technologies Used
- **Node.js**: Backend runtime.
- **Express**: Web framework for routing and middleware.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **JWT**: For secure authentication.
- **AWS SDK**: For S3 bucket integration.
- **Axios**: For external API requests.
- **Spotify API**: For album data and previews.
- **Cors**: Cross-origin resource sharing.

## Project Structure
```plaintext
.
├── controllers/         # Business logic
│   ├── recordController.js
├── middleware/          # Middleware functions
│   ├── auth.js
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Record.js
│   ├── Message.js
│   ├── Notification.js
│   ├── Feedback.js
├── routes/              # API routes
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   ├── messageRoutes.js
│   ├── tradeRoutes.js
│   ├── s3Upload.js
│   ├── spotifyRoutes.js
├── utils/               # Utility functions
│   ├── spotifyAPI.js
├── .env                 # Environment variables
├── server.js            # Main entry point
└── package.json         # Project dependencies and scripts
```

## Getting Started

### Prerequisites
- **Node.js** (v18.17.0 or higher)
- **MongoDB Atlas** or local MongoDB instance.
- **AWS S3** Bucket for image storage.
- **Spotify API** credentials.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/needle-drop-backend.git
   cd needle-drop-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root directory and add the following:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Running the Server
Start the development server:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user.
- `POST /api/users/login` - Login a user.
- `GET /api/users/:id` - Get user profile.
- `POST /api/users/add-looking-for` - Add an album to the user's wishlist.
- `GET /api/users/:id/notifications` - Get user notifications.

### Record Routes
- `GET /api/records` - Get all records.
- `POST /api/records/create` - Create a new record.
- `GET /api/records/:id` - Get a specific record.
- `DELETE /api/records/delete/:id` - Delete a record.

### Messaging Routes
- `POST /api/messages/start` - Start a new conversation.
- `POST /api/messages/send` - Send a message.
- `GET /api/messages/conversations` - Get all conversations.

### Trade Routes
- `POST /api/trades/initiate` - Initiate trade completion.
- `POST /api/trades/confirm` - Confirm trade completion.
- `POST /api/trades/feedback` - Submit feedback after trade.

### Spotify Routes
- `GET /api/spotify/search` - Search for albums.
- `GET /api/spotify/album/:id` - Get album details.

### S3 Upload Routes
- `GET /api/s3/generate-upload-url` - Generate a pre-signed URL for uploading images.

## Frontend Repository
Refer to the [Needle Drop Frontend Repository](https://github.com/alfredo-pasquel/p5_frontend) for setup instructions.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## Contact
For questions or suggestions:
- **Email**: [alfredo.pasquel@gmail.com](mailto:alfredo.pasquel@gmail.com)
- **LinkedIn**: [Alfredo Pasquel](https://www.linkedin.com/in/alfredo-pasquel/)
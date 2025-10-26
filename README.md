# Smart Context-Aware Reminder App

A mobile application built with React Native (Expo) and Node.js that delivers intelligent, context-aware reminders based on location, time, and user activity.

## Overview

Traditional reminders only trigger at fixed times, regardless of whether you're in the right place or situation. This app sends reminders based on real-world context, making them more relevant and actionable.

## Features

### Core Features

- **Natural Language Processing**: Create reminders using conversational language
  - Example: "Remind me to buy milk when I'm near a grocery store"
  - AI-powered parsing extracts tasks, locations, and timing automatically

- **Location-Based Triggers**:
  - Reminders trigger when you enter specific locations
  - Background geolocation with configurable radius
  - Integrated with Google Maps and Places API

- **Smart Categorization**:
  - Automatic categorization (Groceries, Bills, Work, Personal, Health, Shopping)
  - Priority detection (Low, Medium, High)
  - Custom categories support

- **Multiple Trigger Types**:
  - Time-based reminders
  - Location-based reminders
  - Combined time + location triggers

- **Push Notifications**:
  - Real-time notifications when conditions are met
  - Background task support
  - Local and cloud notifications

- **User Authentication**:
  - Secure JWT-based authentication
  - Sign up / Sign in functionality
  - Profile management

- **Cloud Sync**:
  - All reminders synced to MongoDB
  - Access from multiple devices
  - Offline support with local caching

## Tech Stack

### Frontend (Mobile App)
- **React Native** with Expo SDK
- **React Navigation** for routing
- **Context API** for state management
- **Expo Location** for geolocation
- **Expo Notifications** for push notifications
- **Expo Task Manager** for background services
- **Axios** for API communication
- **date-fns** for date formatting

### Backend (API Server)
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **Natural Language Processing**:
  - chrono-node for date/time extraction
  - compromise for text analysis
- **Google Maps Services** for geocoding and places search

## Project Structure

```
SmartCue/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── reminderController.js # Reminder CRUD operations
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Reminder.js          # Reminder schema
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   └── reminderRoutes.js    # Reminder routes
│   ├── services/
│   │   ├── nlpService.js        # Natural language processing
│   │   └── googleMapsService.js # Google Maps integration
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js           # Axios configuration
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Authentication state
│   │   │   └── ReminderContext.js # Reminder state
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── CreateReminderScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── services/
│   │       ├── locationService.js # Location tracking
│   │       └── notificationService.js # Push notifications
│   ├── App.js                   # Main app component
│   ├── app.json                 # Expo configuration
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI (`npm install -g expo-cli`)
- Google Maps API key
- Google Places API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-reminder-app
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `src/config/api.js`:
```javascript
const API_URL = 'http://your-backend-ip:5000/api';
```

4. Start the Expo development server:
```bash
npm start
```

5. Run on device/emulator:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Reminders
- `POST /api/reminders/parse` - Parse natural language reminder (protected)
- `POST /api/reminders` - Create reminder (protected)
- `GET /api/reminders` - Get all reminders (protected)
- `GET /api/reminders/:id` - Get single reminder (protected)
- `PUT /api/reminders/:id` - Update reminder (protected)
- `DELETE /api/reminders/:id` - Delete reminder (protected)
- `PUT /api/reminders/:id/complete` - Mark reminder as complete (protected)
- `POST /api/reminders/check-location` - Check location-based reminders (protected)

## Usage Examples

### Creating a Reminder

#### Natural Language Input:
```
"Remind me to buy milk when I'm near a grocery store"
```

**Parsed Result:**
- Task: "buy milk"
- Category: "Groceries"
- Trigger: "Location-based"
- Location: "grocery store" (geocoded to nearest location)

#### Another Example:
```
"Pay electricity bill before Sunday"
```

**Parsed Result:**
- Task: "Pay electricity bill"
- Category: "Bills"
- Trigger: "Time-based"
- Due Date: [Next Sunday]

### Location-Based Reminder Flow

1. User creates reminder with location trigger
2. App geocodes the location using Google Maps API
3. Background location service monitors user position
4. When user enters the geofence radius, notification is sent
5. Reminder is marked as triggered

## Features in Detail

### Natural Language Processing

The NLP service can understand various reminder formats:

- Location-based: "when I'm at/near/in [place]"
- Time-based: "before [date]", "on [date]", "tomorrow", "next week"
- Action-based: "remind me to [action]"
- Priority indicators: "urgent", "important", "asap"

### Background Location Tracking

- Uses Expo Location and Task Manager
- Configurable update interval (default: 5 minutes)
- Respects battery life with balanced accuracy
- Requires user permission for background location
- Can be enabled/disabled in Settings

### Smart Categorization

Automatically categorizes reminders based on keywords:

- **Groceries**: grocery, store, milk, bread, food
- **Bills**: bill, payment, electricity, rent
- **Work**: office, meeting, presentation
- **Health**: doctor, medicine, workout
- **Shopping**: mall, shop, buy

## Permissions Required

### iOS
- Location (Always/When in Use)
- Notifications
- Background App Refresh

### Android
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- POST_NOTIFICATIONS
- RECEIVE_BOOT_COMPLETED

## Future Enhancements

- [ ] AI-based habit learning
- [ ] Voice input support
- [ ] Calendar integration (Google/Outlook)
- [ ] Recurring reminders
- [ ] Shared reminders with other users
- [ ] Offline mode with local storage
- [ ] Weather-based triggers
- [ ] Activity recognition (driving, walking, etc.)
- [ ] Smart suggestions based on history
- [ ] Widget support
- [ ] Apple Watch / Wear OS support

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

**API Not Responding:**
- Check if server is running on correct port
- Verify firewall settings
- Check server logs for errors

### Frontend Issues

**Cannot Connect to Backend:**
- Update API_URL in src/config/api.js with correct IP
- Ensure backend server is running
- Check network connectivity

**Location Not Working:**
- Grant location permissions in device settings
- Enable background location permission
- Check if location services are enabled

**Notifications Not Showing:**
- Grant notification permissions
- Check notification settings in app
- Verify push token is registered

## Security Considerations

- JWT tokens expire after 30 days
- Passwords hashed with bcrypt (10 rounds)
- API routes protected with authentication middleware
- Environment variables for sensitive data
- HTTPS recommended for production
- MongoDB connection should use SSL in production

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@smartreminder.app

## Acknowledgments

- Built with React Native and Expo
- Powered by Google Maps Platform
- Natural language processing with chrono-node and compromise
- Icons from Expo Vector Icons

---

**Note**: This app requires API keys from Google Cloud Platform for location services. Please ensure you have proper quotas and billing set up for production use.
Santé Initiative Uganda - Vision Health Mobile App (Frontend)
A React Native (Expo) mobile application for community health workers in Uganda to conduct vision screenings, sell reading glasses, and process mobile money payments with offline functionality.

📱 App Overview
Santé Initiative Uganda brings vision health services closer to underserved communities. Community health workers use this app to screen clients, recommend reading glasses, process payments via mobile money, and work completely offline in areas with poor connectivity.

Key Features
Vision Screening: Conduct visual acuity tests and record results

Product Catalog: Browse and sell reading glasses with pricing

Mobile Money Integration: Process payments via Ugandan mobile money services

Offline-First Design: Full functionality without internet connection

Data Sync: Automatic synchronization when back online

Client Management: Track client history and screening results

Payment Tracking: Monitor transactions and generate reports

🏗️ Project Structure
text
frontend/
├── assets/ # Images, fonts, and static assets
│ ├── adaptive-icon.png
│ ├── favicon.png
│ ├── icon.png
│ └── splash.png
├── src/
│ ├── screens/ # Main application screens
│ │ ├── HomeScreen.tsx
│ │ ├── LoginScreen.tsx
│ │ ├── PaymentsScreen.tsx
│ │ ├── ScreeningFormScreen.tsx
│ │ └── ProductsScreen.tsx
│ ├── components/ # Reusable UI components
│ ├── navigation/ # Navigation configuration
│ ├── services/ # API and data services
│ ├── utils/ # Helper functions and utilities
│ └── config/ # Configuration files
├── App.tsx # Main application component
├── app.json # Expo configuration
├── eas.json # EAS Build configuration
└── package.json # Dependencies
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)

npm or yarn

Expo CLI

iOS Simulator (macOS) or Android Studio (Windows/Linux/macOS)

Installation
Clone the repository

bash
git clone https://github.com/dkabagambe/Sant--Initiative-Uganda-vision-health-app.git
cd Sant--Initiative-Uganda-vision-health-app
Install dependencies

bash
npm install

# or

yarn install
Set up environment variables
Create a .env file in the root directory:

env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_APP_VERSION=1.0.0
Start the development server

bash
npx expo start
Running on Devices
iOS Simulator
bash

# Press 'i' in the Expo terminal or

npx expo start --ios
Android Emulator
bash

# Press 'a' in the Expo terminal or

npx expo start --android
Physical Device
Install Expo Go from the App Store or Google Play

Scan the QR code from the terminal or Expo Dev Tools

🔗 Connecting to Backend
The frontend is configured to connect to a Node.js/Express backend. Update the API URL in src/config/api.ts:

typescript
// For development (local backend)
const API_BASE_URL = 'http://localhost:5000/api';

// For production
// const API_BASE_URL = 'https://your-production-api.com/api';
📱 Screens

1. Login Screen
   Phone number authentication with OTP

Role-based access (Community Health Workers)

2. Home Dashboard
   Quick access to all features

Sync status indicator

Recent activity summary

3. Screening Form
   Client information collection

Visual acuity testing interface

Reading glasses recommendation

Save screening results (offline/online)

4. Payments Screen
   Mobile money payment processing

Transaction verification

Payment history and search

Offline payment queuing

5. Products Screen
   Reading glasses catalog

Pricing and inventory information

Quick sale interface

🔄 Offline Functionality
The app uses local storage to maintain functionality without internet:

Data Persistence: All form submissions are saved locally

Queue System: Payments and screenings are queued for sync

Automatic Sync: Data synchronizes automatically when online

Conflict Resolution: Handles data conflicts during sync

📡 API Integration
Service Layer
All API calls are managed through src/services/api.ts:

typescript
import { apiService } from '../services/api';

// Example usage
const submitScreening = async (data) => {
try {
const response = await apiService.createScreening(data);
return response.data;
} catch (error) {
// Handle offline mode
await saveOffline(data);
}
};
Available Endpoints
Authentication: POST /api/auth/login

Screenings: POST /api/screenings

Payments: POST /api/payments

Sync: POST /api/sync

Products: GET /api/products

🎨 UI/UX Design
Design System
Colors: Primary blues and greens for health/trust

Typography: Clear, readable fonts for various literacy levels

Icons: Consistent iconography from Material Community Icons

Layout: Simple, intuitive navigation for field workers

Accessibility Features
High contrast modes for low vision

Large touch targets for field use

Clear visual hierarchy

Screen reader compatibility

📦 Dependencies
Core Dependencies
json
{
"expo": "~49.0.0",
"react": "18.2.0",
"react-native": "0.72.0",
"@react-navigation/native": "^6.1.0",
"axios": "^1.5.0",
"async-storage": "^1.18.0"
}
Development Dependencies
json
{
"@types/react": "~18.2.0",
"typescript": "^5.1.0",
"@expo/vector-icons": "^13.0.0"
}
🧪 Testing
Running Tests
bash

# Unit tests

npm test

# UI tests

npm run test:ui

# E2E tests

npm run test:e2e
Test Structure
Unit tests in **tests** directories

Component tests with React Native Testing Library

E2E tests with Detox (configured)

📲 Building for Production
Android APK
bash
eas build --platform android --profile production
iOS IPA
bash
eas build --platform ios --profile production
Over-the-Air Updates
bash
eas update --branch production --message "New features added"
🔧 Troubleshooting
Common Issues
Metro Bundler not starting

bash
rm -rf node_modules
npm install
npx expo start --clear
iOS build failures

bash
cd ios
pod install --repo-update
API connection errors

Verify backend is running: http://localhost:5000/api/health

Check network permissions in app.json

🤝 Contributing
Fork the repository

Create a feature branch: git checkout -b feature-name

Commit changes: git commit -m 'Add feature'

Push to branch: git push origin feature-name

Open a Pull Request

Code Style
TypeScript with strict mode enabled

Functional components with hooks

ESLint and Prettier configured

Follow React Native best practices

📄 License
This project is proprietary and confidential. All rights reserved.

📞 Support
For technical support or questions:

Developer: Daniel Kabagambe

Email: danielkabagambe@gmail.com

Project Lead: Santé Initiative Uganda

Built with ❤️ for community health workers in Uganda
Santé Initiative Uganda © 2026
Bringing vision health services closer to communities

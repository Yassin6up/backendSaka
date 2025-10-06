# Jbuy Backend API

A clean, well-structured Node.js backend API for the Jbuy application built with Express.js and MySQL.

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── app.js        # Application configuration
│   └── database.js   # Database configuration
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── placeController.js
│   ├── bookingController.js
│   ├── adminController.js
│   ├── notificationController.js
│   └── index.js
├── middleware/       # Custom middleware
│   ├── cors.js
│   ├── bodyParser.js
│   ├── multer.js
│   ├── auth.js
│   └── index.js
├── routes/          # Route definitions
│   ├── auth.js
│   ├── places.js
│   ├── bookings.js
│   ├── admin.js
│   ├── notifications.js
│   ├── files.js
│   └── index.js
├── services/        # Business logic services
│   ├── smsService.js
│   ├── notificationService.js
│   ├── userService.js
│   ├── placeService.js
│   ├── bookingService.js
│   └── index.js
├── utils/           # Utility functions
│   ├── response.js
│   ├── validation.js
│   ├── fileUpload.js
│   └── index.js
└── app.js           # Main application file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   PORT=5000
   NODE_ENV=development
   EXPO_ACCESS_TOKEN=your_expo_access_token
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/send-verification-code` - Send SMS verification code
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/update-profile` - Update user profile (protected)

### Places
- `GET /api/places` - Get all places
- `GET /api/places/search` - Search places
- `GET /api/places/:id` - Get place by ID
- `GET /api/places/by-owner/:ownerId` - Get places by owner
- `POST /api/places/add` - Create new place (protected)
- `PUT /api/places/:id` - Update place (protected)
- `DELETE /api/places/:id` - Delete place (protected)
- `POST /api/places/:id/toggle-active` - Toggle place status (protected)

### Bookings
- `POST /api/bookings/add` - Create booking (protected)
- `GET /api/bookings` - Get all bookings (protected)
- `GET /api/bookings/user` - Get user bookings (protected)
- `GET /api/bookings/owner` - Get owner bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `PUT /api/bookings/:id/status` - Update booking status (protected)
- `DELETE /api/bookings/:id` - Delete booking (protected)
- `GET /api/bookings/titles/:placeId` - Get booking titles (protected)

### Admin
- `GET /api/admin/dashboard` - Get dashboard data (admin)
- `GET /api/admin/places` - Get all places (admin)
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/reports` - Get all reports (admin)
- `POST /api/admin/places/:id/approve` - Approve place (admin)
- `POST /api/admin/places/:id/reject` - Reject place (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `PUT /api/admin/users/:userId/block` - Block/unblock user (admin)
- `PUT /api/admin/reports/:reportId/status` - Update report status (admin)

### Notifications
- `POST /api/notifications/send` - Send notification (protected)
- `GET /api/notifications/user/:userId` - Get user notifications (protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)
- `GET /api/notifications/unread/:userId` - Get unread count (protected)
- `POST /api/notifications/toggle-blocked/:id` - Toggle user blocked status (protected)
- `POST /api/notifications/toggle-trustable/:id` - Toggle user trustable status (protected)
- `GET /api/notifications/blocked-status/:userId` - Get user status (protected)

### Files
- `GET /api/images/:folderName/:imageName` - Serve uploaded images
- `GET /api/user/:id` - Serve user profile pictures

## 🛠️ Features

- **Clean Architecture**: Well-organized code structure with separation of concerns
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Upload**: Multer-based file upload with image validation
- **SMS Integration**: SMS verification service
- **Push Notifications**: Expo push notification service
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database Integration**: MySQL database with connection pooling
- **Cron Jobs**: Automated cleanup tasks
- **Graceful Shutdown**: Proper server shutdown handling

## 🔧 Configuration

The application uses environment variables for configuration. See `.env.example` for all available options.

## 📝 Database Schema

The application expects the following main tables:
- `users` - User accounts
- `places` - Property listings
- `bookings` - Property bookings
- `notifications` - User notifications
- `admins` - Admin accounts
- `reports` - User reports
- `phone_verifications` - SMS verification codes
- `admin_actions_history` - Admin action logs

## 🚀 Deployment

1. Set up your production environment variables
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

## 📄 License

This project is licensed under the ISC License.
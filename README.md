# Clean Backend Server

A well-structured, organized backend server built with Node.js, Express, and MySQL.

## 📁 Project Structure

```
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── README.md             # Project documentation
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection
│   │   └── constants.js  # Application constants
│   ├── controllers/      # Business logic controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── placesController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   ├── middleware/       # Custom middleware
│   │   ├── cors.js       # CORS configuration
│   │   ├── bodyParser.js # Body parser configuration
│   │   └── upload.js     # File upload configurations
│   ├── routes/           # Route definitions
│   │   ├── auth.js       # Authentication routes
│   │   ├── users.js      # User management routes
│   │   ├── places.js     # Places/listings routes
│   │   ├── bookings.js   # Booking management routes
│   │   ├── admin.js      # Admin panel routes
│   │   ├── notifications.js # Notification routes
│   │   └── images.js     # Image serving routes
│   └── utils/            # Utility functions
│       ├── sms.js        # SMS sending utilities
│       ├── notifications.js # Push notification utilities
│       ├── helpers.js    # General helper functions
│       └── cronJobs.js   # Scheduled tasks
└── uploads/              # File upload directories
    ├── temp/             # Temporary uploads
    ├── profiles/         # Profile pictures
    ├── places/           # Place images
    ├── slides/           # Slide images
    └── icons/            # Icon files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clean-backend-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create the database and tables (refer to your existing database schema)

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/reset-password` - Password reset

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users/update-user` - Update user information
- `POST /api/users/update-picture/user` - Update profile picture

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places/add` - Add new place
- `POST /api/places/filter` - Filter places
- `DELETE /api/places/:id` - Delete place

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings/add` - Create new booking
- `POST /api/bookings/update-booking-status` - Update booking status

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/counts` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/places` - Get all places

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications/send-notification` - Send bulk notification

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `NODE_ENV` | Environment | development |

### File Uploads

The server supports multiple file upload types:
- Profile pictures → `uploads/profiles/`
- Place images → `uploads/places/`
- Documents → `uploads/temp/`

## 🛠️ Features

- **Clean Architecture**: Organized into controllers, routes, middleware, and utilities
- **File Upload**: Multiple upload configurations for different file types
- **SMS Integration**: SMS verification code sending
- **Push Notifications**: Expo push notification support
- **Cron Jobs**: Automated cleanup tasks
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configurable CORS settings
- **Environment Configuration**: Flexible environment-based configuration

## 🔒 Security Features

- Input validation
- SQL injection prevention
- File upload restrictions
- Session token management
- Password hashing (implement bcrypt for better security)

## 📈 Performance

- Database connection pooling
- Efficient file handling
- Optimized queries
- Caching strategies (can be implemented)

## 🧪 Testing

```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Consider implementing bcrypt for password hashing instead of SHA256
- Add input validation middleware
- Implement rate limiting
- Add API documentation with Swagger

## 🔮 Future Enhancements

- [ ] Add comprehensive input validation
- [ ] Implement bcrypt for password hashing
- [ ] Add rate limiting middleware
- [ ] Create API documentation with Swagger
- [ ] Add unit and integration tests
- [ ] Implement caching with Redis
- [ ] Add logging with Winston
- [ ] Database migration system
- [ ] Health check endpoints
- [ ] Monitoring and metrics
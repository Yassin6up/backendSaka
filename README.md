# JBuy Backend Server

A clean, well-structured Node.js backend server for the JBuy application built with Express.js and MySQL.

## 🏗️ Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Database connection
│   │   └── upload.js    # File upload configuration
│   ├── controllers/     # Business logic controllers
│   │   ├── authController.js
│   │   ├── placesController.js
│   │   ├── notificationsController.js
│   │   ├── bookingsController.js
│   │   └── categoriesController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Place.js
│   │   └── Booking.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── places.js
│   │   ├── notifications.js
│   │   ├── bookings.js
│   │   └── categories.js
│   ├── services/        # External services
│   │   ├── smsService.js
│   │   └── notificationService.js
│   └── app.js          # Main application file
├── uploads/            # File uploads directory
│   ├── temp/
│   ├── profile/
│   ├── places/
│   ├── slides/
│   ├── icons/
│   └── services/
├── package.json
├── .env.example
└── README.md
```

## 🚀 Features

- **Clean Architecture**: Separated concerns with controllers, models, services, and middleware
- **Authentication**: User authentication and authorization
- **File Upload**: Multer-based file upload with multiple storage options
- **SMS Integration**: SMS service for verification codes
- **Push Notifications**: Expo push notification support
- **Database Models**: Clean database abstraction with MySQL
- **Error Handling**: Comprehensive error handling middleware
- **Validation**: Input validation middleware
- **API Routes**: RESTful API endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jbuy-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # SMS API Configuration
   SMS_USER=JbuyApp1
   SMS_PASS=429J@NewY
   SMS_SID=Jbuy.App
   SMS_BASE_URL=http://82.212.81.40:8080/websmpp/websms
   ```

4. **Database Setup**
   - Create a MySQL database
   - Import your database schema (create tables as needed)
   - Update the database connection details in `.env`

5. **Start the server**
   ```bash
   # Development mode
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
- `GET /api/auth/profile/:userId` - Get user profile
- `POST /api/auth/user/update-user` - Update user profile

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places/add` - Create new place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `GET /api/places/search` - Search places
- `GET /api/places/category-counts` - Get category counts

### Notifications
- `POST /api/notifications/send-notification` - Send notification
- `GET /api/notifications/api/notifications/:userId` - Get user notifications
- `POST /api/notifications/api/notifications/read/:id` - Mark as read
- `DELETE /api/notifications/api/notifications/:id` - Delete notification

### Bookings
- `POST /api/bookings/api/bookings/add` - Create booking
- `GET /api/bookings/get-all-bookings` - Get all bookings
- `POST /api/bookings/get-bookings-by-user` - Get user bookings
- `POST /api/bookings/update-booking-status` - Update booking status

### Categories
- `GET /api/categories/all` - Get all categories
- `GET /api/categories/slug` - Get categories with slugs
- `POST /api/categories/admin/create` - Create category (admin)
- `PUT /api/categories/admin/:id` - Update category (admin)

## 🔧 Configuration

### File Upload
The server supports multiple file upload configurations:
- Profile pictures: `/uploads/profile/`
- Place images: `/uploads/places/`
- General uploads: `/uploads/temp/`

### Database Models
- **User**: User management with authentication
- **Place**: Property/place listings
- **Booking**: Booking management
- **Category**: Place categories

### Services
- **SMS Service**: Handles SMS sending for verification
- **Notification Service**: Manages push notifications

## 🛡️ Security Features

- Input validation middleware
- SQL injection prevention
- File upload restrictions
- CORS configuration
- Error handling without sensitive data exposure

## 📝 Development

### Adding New Routes
1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Import and use in `src/app.js`

### Adding New Models
1. Create model file in `src/models/`
2. Follow the existing pattern for database operations

### Adding New Services
1. Create service file in `src/services/`
2. Import and use in controllers

## 🚀 Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure production database
3. Set up reverse proxy (nginx)
4. Use PM2 for process management
5. Configure SSL certificates

## 📞 Support

For support and questions, please contact the development team.

## 📄 License

This project is licensed under the MIT License.
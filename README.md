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
- `POST /api/auth/update-picture/user` - Update profile picture
- `GET /api/auth/user/profile-picture/:imageName` - Get profile picture

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `POST /api/places/add` - Create new place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place
- `GET /api/places/search` - Search places
- `GET /api/places/category-counts` - Get category counts
- `GET /api/places/by-owner/:ownerId` - Get places by owner
- `POST /api/places/:id/toggle-active` - Toggle place active status
- `GET /api/places/similar-products` - Get similar places
- `POST /api/places/filter/spesific` - Filter places with specific criteria

### Notifications
- `POST /api/notifications/send-notification` - Send notification
- `GET /api/notifications/api/notifications/:userId` - Get user notifications
- `POST /api/notifications/api/notifications/read/:id` - Mark as read
- `DELETE /api/notifications/api/notifications/:id` - Delete notification
- `GET /api/notifications/api/notifications/unread/:userId` - Get unread count
- `POST /api/notifications/toggle_blocked/:id` - Toggle user blocked status
- `POST /api/notifications/toggle_trustable/:id` - Toggle user trustable status

### Bookings
- `POST /api/bookings/api/bookings/add` - Create booking
- `GET /api/bookings/get-all-bookings` - Get all bookings
- `POST /api/bookings/get-bookings-by-user` - Get user bookings
- `POST /api/bookings/update-booking-status` - Update booking status
- `GET /api/bookings/api/bookings/get/:id` - Get booking by ID
- `GET /api/bookings/bookings/getTitles/:place_id` - Get booking titles for place
- `DELETE /api/bookings/bookings/:id` - Delete booking

### Categories
- `GET /api/categories/all` - Get all categories
- `GET /api/categories/slug` - Get categories with slugs
- `GET /api/categories/admin/all` - Get all categories (admin)
- `POST /api/categories/admin/create` - Create category (admin)
- `PUT /api/categories/admin/:id` - Update category (admin)
- `DELETE /api/categories/admin/:id` - Delete category (admin)
- `PUT /api/categories/toggle/:slug` - Toggle category active status

### Reviews & Ratings
- `POST /api/reviews/reviews/add` - Add review
- `GET /api/reviews/reviews/:place_id` - Get place reviews
- `GET /api/reviews/user/:userId/reviews` - Get user reviews
- `PUT /api/reviews/reviews/:reviewId` - Update review
- `DELETE /api/reviews/comments/:reviewId` - Delete review

### Likes & Follows
- `POST /api/likes/like` - Toggle like for place
- `GET /api/likes/api/user/:userId/likes` - Get user's liked places
- `GET /api/likes/places/:placeId/likes` - Get place like count
- `GET /api/likes/user/:userId/place/:placeId/liked` - Check if user liked place
- `POST /api/follows/follow/user` - Toggle follow relationship
- `GET /api/follows/user/:userId/followers` - Get user's followers
- `GET /api/follows/user/:userId/following` - Get user's following
- `GET /api/follows/user/:userId/follow-counts` - Get follow counts

### Reports
- `POST /api/reports/api/report` - Create report
- `GET /api/reports/api/reports` - Get all reports (admin)
- `GET /api/reports/api/reports/:reportId` - Get report by ID (admin)
- `PUT /api/reports/reports/:reportId/status` - Update report status (admin)
- `GET /api/reports/user/:userId/reports` - Get user's reports
- `DELETE /api/reports/reports/:reportId` - Delete report (admin)

### Services
- `GET /api/services/api/services` - Get all services
- `GET /api/services/api/getOnce/services/:id` - Get service by ID
- `GET /api/services/services/car` - Get car services
- `POST /api/services/api/services` - Create service (admin)
- `PUT /api/services/api/services/:id` - Update service (admin)
- `DELETE /api/services/api/services/:id` - Delete service (admin)
- `PUT /api/services/api/services/:id/toggle` - Toggle service active status (admin)

### Admin
- `POST /api/admin/api/admin/login` - Admin login
- `GET /api/admin/api/admin/getData` - Get admin dashboard data
- `GET /api/admin/admin/counts` - Get admin counts
- `GET /api/admin/admins` - Get all admins
- `POST /api/admin/admins` - Create admin
- `DELETE /api/admin/admins/:id` - Delete admin
- `POST /api/admin/admin/update-password` - Update admin password
- `GET /api/admin/admin/users` - Get all users (admin)
- `PUT /api/admin/api/users/update` - Update user (admin)
- `POST /api/admin/admin/delete/users/:id` - Delete user (admin)

### Settings
- `GET /api/settings/get-settings` - Get settings
- `GET /api/settings/privacy` - Get privacy policy
- `GET /api/settings/terms` - Get terms of service
- `POST /api/settings/update-settings` - Update settings (admin)
- `GET /api/settings/get-settings-admin` - Get settings for admin

### Slides
- `GET /api/slides/api/slides` - Get all slides
- `GET /api/slides/api/slides/single/:fileName` - Get single slide
- `GET /api/slides/api/icons/single/:fileName` - Get single icon
- `POST /api/slides/api/slides` - Create slide (admin)
- `DELETE /api/slides/api/slides/:fileName` - Delete slide (admin)

### Subscriptions
- `GET /api/subscriptions/api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions/api/subscriptions` - Create subscription (admin)
- `PUT /api/subscriptions/api/subscriptions/:id` - Update subscription (admin)
- `DELETE /api/subscriptions/api/subscriptions/:id` - Delete subscription (admin)

### Property Requests
- `POST /api/requests/requests` - Create property request
- `GET /api/requests/api/requests` - Get all property requests
- `POST /api/requests/user/matching-requests` - Get matching requests for user
- `GET /api/requests/api/requests/:id` - Get request by ID
- `PUT /api/requests/api/requests/:id` - Update request
- `DELETE /api/requests/api/requests/:id` - Delete request

### User Interests
- `POST /api/interests/user/interests` - Save user interests
- `GET /api/interests/user/:userId/interests` - Get user interests
- `GET /api/interests/api/interests` - Get all available interests
- `GET /api/interests/api/interests/:interest/users` - Get users by interest
- `DELETE /api/interests/user/:userId/interests` - Delete user interests

### User Profile
- `GET /api/user-profile/user/:userId` - Get user profile with posts
- `GET /api/user-profile/profile/places` - Get profile places

### VIP Management
- `POST /api/vip/api/make-vip` - Make place VIP (admin)
- `GET /api/vip/api/vip-places` - Get VIP places
- `GET /api/vip/api/places/:placeId/vip-status` - Check VIP status

### Admin Actions
- `GET /api/admin-actions/api/admin-actions/:placeId` - Get admin actions for place
- `POST /api/admin-actions/api/admin-actions` - Log admin action
- `GET /api/admin-actions/api/admin-actions` - Get all admin actions
- `DELETE /api/admin-actions/api/admin-actions/:actionId` - Delete admin action

### Ads Management
- `POST /api/ads/ads/update/:id` - Update ads
- `GET /api/ads/ads/owner/:ownerId` - Get ads by owner
- `GET /api/ads/api/ads` - Get all ads

### User Actions
- `PUT /api/user-actions/users/action/:userId/block` - Block user (admin)
- `PUT /api/user-actions/users/action/:userId/unblock` - Unblock user (admin)
- `PUT /api/user-actions/places/:placeId/stop` - Stop place (admin)
- `GET /api/user-actions/users/:userId/actions` - Get user action history

### Utility Routes
- `GET /api/images/:folderName/:imageName` - Get image file
- `GET /checkUser/:id/limitPosts` - Check user post limit
- `GET /images/user/:id` - Get user images
- `POST /check-phone` - Check if phone number exists
- `POST /reset-password-forget` - Reset password for forgotten password
- `POST /user/phone-verification` - Verify user phone
- `POST /user/update-phone` - Update user phone
- `GET /places/filter/city` - Filter places by city
- `GET /places/buyOrRent/count` - Get buy/rent counts
- `GET /places/visits` - Get places visits statistics
- `GET /admin/filter-places` - Admin filter places
- `GET /admin/places/gat/:id` - Get place for admin
- `POST /api/admin/add-user` - Admin add user
- `DELETE /places/:id` - Delete place
- `PUT /places/:id/approve` - Approve place
- `DELETE /bookings/:id` - Delete booking

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
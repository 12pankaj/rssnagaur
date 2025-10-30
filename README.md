# User Management System

A comprehensive user management system with role-based access control built with Next.js and PostgreSQL.

## Features

### User Roles
- **Super Admin**: Can view all users, manage user roles, and access all data
- **Admin**: Can view all user data and forms with filtering capabilities
- **Guest**: Can access dashboard with multiple menus and fill forms

### Authentication
- OTP-based authentication system
- Secure password hashing with bcrypt
- JWT token-based session management

### Guest User Features
- **Grh Sampar Form**: Multi-step form with location selection (District → Tehsil → Mandal)
- **Vitrit Savaymsevak Vivran**: Volunteer service management (coming soon)

### Admin Features
- View all user data with filtering options
- Filter by district, tehsil, and mandal
- Data analysis and reporting

### Super Admin Features
- Complete user management
- Role distribution (admin/guest)
- User verification status management
- Comprehensive analytics

## Setup Instructions

### 1. Database Setup
1. Install PostgreSQL and pgAdmin
2. Create a database named `user_management`
3. Run the SQL script from `lib/database.sql` in pgAdmin
4. Update the database connection details in `lib/db.ts`

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/user_management"

# JWT Secret (change this to a secure random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (for OTP sending)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 3. Email Setup (Optional but Recommended)
For OTP delivery via email:

1. **Gmail Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: Google Account → Security → App passwords
   - Use the app password in `EMAIL_PASS` environment variable

2. **Other Email Services:**
   - Update the email service in `lib/email.ts`
   - Configure appropriate SMTP settings

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Credentials

### Super Admin
- Mobile: 9999999999
- Email: admin@example.com
- Password: admin123

## Color Scheme

- **Primary (Saffron)**: #F1C338
- **Background (Brown)**: #895129
- **Text & Icons (White)**: #FFFFFF
- **Accent (Deep Blue)**: #0D47A1

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Users
- `GET /api/users` - Get all users (Admin/Super Admin only)
- `PUT /api/users` - Update user role (Super Admin only)

### Locations
- `GET /api/locations/districts` - Get all districts
- `GET /api/locations/tehsils?districtId=X` - Get tehsils by district
- `GET /api/locations/mandals?tehsilId=X` - Get mandals by tehsil

### Forms
- `POST /api/forms/grh-sampar` - Submit Grh Sampar form (Guest only)
- `GET /api/forms/grh-sampar` - Get all forms (Admin/Super Admin only)

## Database Schema

The system includes the following main tables:
- `users` - User accounts and roles
- `otps` - OTP verification
- `districts` - District data
- `tehsils` - Tehsil data
- `mandals` - Mandal data
- `grh_sampar_forms` - Form submissions

## Development

This project uses:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- PostgreSQL with pg (node-postgres)
- React Hot Toast for notifications
- Lucide React for icons

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention with parameterized queries"# rssnagaur" 

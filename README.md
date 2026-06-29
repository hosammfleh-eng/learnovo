# 🎓 Learnovo - E-Learning Platform

An integrated educational platform built with **React + Vite** for the frontend and **NestJS + MongoDB** for the backend.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Admin
- System management and configuration
- Course creation and management
- Approve/reject enrollment requests
- View all students and teachers
- Clean old notifications

### Teacher
- View assigned courses
- Manage enrolled students
- Enter and update grades
- View course statistics

### Student
- Browse available courses
- Request course enrollment
- Track enrollment status
- View grades and academic progress
- Graduation request

### General
- JWT-based authentication
- Real-time notifications
- Responsive design
- Multi-language support (Arabic/English)

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **TypeORM** - ORM for MongoDB
- **JWT** - Authentication
- **Class Validator** - Data validation
- **Bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **React Router DOM v7** - Routing
- **Axios** - HTTP client
- **React Context** - State management

## 📁 Project Structure
educational/
├── learnovo/ # Backend - NestJS API
│ ├── src/
│ │ ├── modules/
│ │ │ ├── auth/ # User authentication
│ │ │ ├── course/ # Course management
│ │ │ ├── users/ # User management
│ │ │ ├── students/ # Student profiles
│ │ │ ├── teacher-profile/# Teacher profiles
│ │ │ ├── teacher-assignment/ # Teacher-course assignments
│ │ │ ├── enrollments/ # Enrollment requests
│ │ │ ├── grades/ # Grades management
│ │ │ ├── notifications/ # Notifications system
│ │ │ └── graduation/ # Graduation requests
│ ├── package.json
│ └── ...
└── project/ # Frontend - React + Vite
├── src/
│ ├── pages/
│ │ ├── public/ # Public pages (Login, Register, Home)
│ │ ├── student/ # Student dashboard & pages
│ │ ├── teacher/ # Teacher dashboard & pages
│ │ └── admin/ # Admin dashboard & pages
│ ├── components/ # Reusable UI components
│ ├── hooks/ # Custom React hooks
│ ├── context/ # React context providers
│ └── services/ # API integration services
├── package.json
└── ... 


API Endpoints
Authentication
Method	Endpoint	Description	Auth Required
POST	/api/auth/login	User login	No
POST	/api/auth/register	Create account	No
GET	/api/auth/verify	Verify JWT token	Yes
Courses
Method	Endpoint	Description	Auth Required
GET	/api/courses/available	Get available courses	Yes
GET	/api/courses/:id	Get course details	Yes
GET	/api/courses/teacher/:teacherId	Get teacher's courses	Yes
GET	/api/courses/student/:studentId	Get student's courses	Yes
GET	/api/courses/statistics	Get course statistics	Admin
POST	/api/courses	Create course	Admin
Enrollment
Method	Endpoint	Description	Auth Required
POST	/api/enrollments	Request enrollment	Yes
PUT	/api/enrollments/:id	Update enrollment status	Admin
GET	/api/enrollments/student/:id	Get student enrollments	Yes
GET	/api/enrollments/course/:id	Get course enrollments	Teacher/Admin
Grades
Method	Endpoint	Description	Auth Required
POST	/api/grades	Add grade	Teacher
PUT	/api/grades/:id	Update grade	Teacher
GET	/api/grades/student/:id	Get student grades	Yes
GET	/api/grades/course/:id	Get course grades	Teacher/Admin
Notifications
Method	Endpoint	Description	Auth Required
GET	/api/notifications	Get user notifications	Yes
POST	/api/notifications/clean	Clean old notifications	Admin
PUT	/api/notifications/:id	Mark as read	Yes
Graduation
Method	Endpoint	Description	Auth Required
POST	/api/graduation	Submit graduation request	Student
GET	/api/graduation	Get graduation status	Yes
PUT	/api/graduation/:id	Update graduation status	Admin
👥 User Roles
👑 Admin
Full system access

Create and manage courses

Approve enrollment requests

Approve graduation requests

Manage teachers and students

System configuration

👨‍🏫 Teacher
View assigned courses

Manage student enrollments

Enter and update grades

View course statistics

Access course materials

👨‍🎓 Student
Browse available courses

Request enrollment

Track enrollment status

View grades

Request graduation

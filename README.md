Learnovo - E-Learning Platform
An integrated educational platform built with React + Vite for the frontend and NestJS + MongoDB for the backend.

Project Structure
text
educational/
├── learnovo/           # Backend - NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # User authentication
│   │   │   ├── course/         # Course management
│   │   │   ├── users/          # User management
│   │   │   ├── students/       # Student profiles
│   │   │   ├── teacher-profile/  # Teacher profiles
│   │   │   ├── teacher-assignment/ # Teacher-course assignments
│   │   │   ├── enrollments/    # Enrollment requests
│   │   │   ├── grades/         # Grades
│   │   │   ├── notifications/  # Notifications
│   │   │   └── graduation/     # Graduation requests
│   ├── package.json
│   └── ...
└── project/            # Frontend - React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── public/          # Public pages
    │   │   ├── student/         # Student pages
    │   │   ├── teacher/         # Teacher pages
    │   │   └── admin/           # Admin pages
    │   ├── components/          # UI components
    │   ├── hooks/               # React hooks
    │   ├── context/             # React context
    │   └── services/            # API services
    ├── package.json
    └── ...
Running the Application
Backend (learnovo)
bash
cd learnovo
npm install
npm run start:dev
Frontend (project)
bash
cd project
npm install
npm run dev
API Endpoints
Authentication
POST /api/auth/login - User login

POST /api/auth/register - Create account

GET /api/auth/verify - Verify token

Courses
GET /api/courses/available - Get courses available for enrollment

GET /api/courses/:id - Course details

GET /api/courses/teacher/:teacherId - Teacher's courses

GET /api/courses/student/:studentId - Student's courses

GET /api/courses/statistics - Course statistics

Enrollment
POST /api/enrollments - Request course enrollment (requires JWT token)

Notifications
POST /api/notifications/clean - Clean old notifications (admin only)

User Roles
Admin - System management, course creation, approve requests

Student - View courses, request enrollment, view grades

Teacher - View assigned courses, enter grades

Technologies Used
Backend
NestJS

MongoDB + TypeORM

JWT Authentication

Class Validator

Frontend
React 19

Vite

TailwindCSS

React Router DOM v7

Axios

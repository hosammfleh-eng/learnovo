 # Learnovo - منصة التعلم الإلكتروني

منصة تعليمية متكاملة مكتوبة باستخدام **React + Vite** للواجهة الأمامية و**NestJS + MongoDB** للواجهة الخلفية.

## بنية المشروع

```
educational/
├── learnovo/           # Backend - NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # مصادقة المستخدمين
│   │   │   ├── course/         # إدارة الدورات
│   │   │   ├── users/          # إدارة المستخدمين
│   │   │   ├── students/       # ملفات الطلاب
│   │   │   ├── teacher-profile/  # ملفات المعلمين
│   │   │   ├── teacher-assignment/ # إسناد المعلمين بالدورات
│   │   │   ├── enrollments/    # طلبات التسجيل
│   │   │   ├── grades/         # الدرجات
│   │   │   ├── notifications/  # الإشعارات
│   │   │   └── graduation/     # طلبات التخرج
│   ├── package.json
│   └── ...
└── project/            # Frontend - React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── public/          # الصفحات العامة
    │   │   ├── student/         # صفحات الطالب
    │   │   ├── teacher/         # صفحات المعلم
    │   │   └── admin/           # صفحات المدير
    │   ├── components/          # مكونات الواجهة
    │   ├── hooks/               # React hooks
    │   ├── context/             # React context
    │   └── services/            # API services
    ├── package.json
    └── ...
```

## التشغيل

### Backend (learnovo)
```bash
cd learnovo
npm install
npm run start:dev
```

### Frontend (project)
```bash
cd project
npm install
npm run dev
```

## API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب
- `GET /api/auth/verify` - التحقق من التوكن

### الدورات
- `GET /api/courses/available` - جلب الدورات المتاحة للتسجيل
- `GET /api/courses/:id` - تفاصيل دورة
- `GET /api/courses/teacher/:teacherId` - دورات المعلم
- `GET /api/courses/student/:studentId` - دورات الطالب
- `GET /api/courses/statistics` - إحصائيات الدورات

### التسجيل
- `POST /api/enrollments` - طلب انضمام لدورة (يحتاج توكن JWT)

### الإشعارات
- `POST /api/notifications/clean` - تنظيف الإشعارات القديمة (مدير فقط)

## أدوار المستخدمين

- **Admin** - إدارة النظام، إنشاء دورات، موافقة الطلبات
- **Student** - عرض الدورات، طلب الانضمام، عرض الدرجات
- **Teacher** - عرض الدورات المكلفة، إدخال الدرجات

## التقنيات المستخدمة

### Backend
- NestJS
- MongoDB + TypeORM
- JWT Authentication
- Class Validator

### Frontend
- React 19
- Vite
- TailwindCSS
- React Router DOM v7
- Axios

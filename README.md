# 🚀 LeadCRM - Full Stack Lead Management CRM

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Blue)
![Node.js](https://img.shields.io/badge/Node.js-Green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 📌 Project Overview

LeadCRM is a modern Lead Management CRM built as part of a Full Stack Developer Internship Assignment.

The application helps businesses efficiently manage customer leads throughout the sales pipeline by providing lead creation, tracking, searching, filtering, analytics, and status management capabilities.

The project follows a full-stack architecture using Next.js, Express.js, and MongoDB with a focus on scalability, clean code, responsiveness, and user experience.

---

## 🎯 Assignment Requirements Coverage

### Core Requirements

✅ Add New Leads

✅ View All Leads

✅ Update Lead Status

✅ Edit Lead Details

✅ Delete Leads

✅ Search Leads

### Required Fields

✅ Name

✅ Email

✅ Phone Number

✅ Company Name

✅ Lead Status

✅ Notes

✅ Created Date

---

## ✨ Features

### Lead Management

- Create new leads
- Update lead information
- Delete leads
- Manage lead lifecycle
- Real-time form validation

### Search & Filtering

- Search by Name
- Search by Email
- Search by Company
- Filter by Lead Status
- Instant search experience

### Dashboard Analytics

- Total Leads
- New Leads
- Contacted Leads
- Qualified Leads
- Converted Leads
- Lost Leads
- Conversion Tracking

### Data Management

- Pagination
- Sorting
- Filtering
- Server-side querying
- Optimized database operations

### User Experience

- Fully Responsive Design
- Mobile Friendly Interface
- Loading States
- Error Handling
- Clean Modern UI

---

## 📸 Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Lead Management

![Lead List](./screenshots/leads.png)

### Add Lead

![Add Lead](./screenshots/add-lead.png)

### Analytics

![Analytics](./screenshots/analytics.png)

---

## 🛠 Tech Stack

### Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Lucide Icons

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Vercel (Frontend)
- Vercel (Backend)
- MongoDB Atlas

---

## 🏗 Architecture

```text
Frontend (Next.js)
        │
        ▼
REST API (Express.js)
        │
        ▼
MongoDB Atlas
```

---

## 📂 Project Structure

```text
LeadCRM/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db/
│
├── screenshots/
│
└── README.md
```

---

## 🔌 API Endpoints

### Create Lead

```http
POST /api/leads
```

### Get All Leads

```http
GET /api/leads
```

### Get Single Lead

```http
GET /api/leads/:id
```

### Update Lead

```http
PUT /api/leads/:id
```

### Delete Lead

```http
DELETE /api/leads/:id
```

### Search Leads

```http
GET /api/leads?search=query
```

---

## ⚙ Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/POWER-WORLD/LeadCRM_web.git
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## 🌐 Live Demo

### Frontend

https://lead-crm-web.vercel.app/

### Backend

https://lead-crm-web-backend.vercel.app/health

---

## 🎁 Bonus Features Implemented

✅ Dashboard Statistics

✅ Pagination

✅ Sorting

✅ Filtering

✅ Responsive Design

✅ Deployment

✅ Loading States

✅ Error Handling

✅ Clean Architecture

---

## 🔮 Future Improvements

- Authentication & Authorization
- Role-based Access Control
- Lead Activity History
- Email Notifications
- CSV Export
- Team Collaboration
- Advanced Analytics Dashboard

---

## 👨‍💻 Developer

### Pawan Kumar

B.Tech Computer Science Engineering

GitHub:
https://github.com/POWER-WORLD

LinkedIn:
https://www.linkedin.com/in/pawan-kumar-23a3402b3/

LeetCode:
https://leetcode.com/u/Pawankumar3253702/

---

## 📝 Assignment Submission

This project was developed as part of a Full Stack Developer Internship Assignment to demonstrate:

- Frontend Development Skills
- Backend API Design
- Database Integration
- Full Stack Architecture
- Problem Solving
- Responsive UI Development
- Clean Code Practices

Thank you for reviewing my submission.
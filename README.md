

---

```md
A modern **MERN stack** based appointment booking platform that supports:

✅ User & Admin dashboards  
✅ Multiple service providers & service types  
✅ JWT authentication (users see only their bookings)  
✅ Real-time slot availability  
✅ Booking cancellation & conflict resolution  
✅ Fast database queries using proper indexing  
✅ Resume-ready project architecture

---

## 🚀 Live Demo Architecture

- **Frontend:** Deployed on **Vercel**
- **Backend:** Deployed on **Render / Railway**
- **Database:** **MongoDB Atlas**

> ⚠️ Credentials are NOT stored in the repository.  
> Mongo URI and JWT secret are securely loaded from environment variables.

---

## 🧠 Tech Stack

| Component | Technology |
|--------|------------|
| Frontend | React (Vite), Tailwind/Inline CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas), Mongoose |
| Auth | JSON Web Token (JWT), Bcrypt |
| API Testing | Postman / Postman Collection |
| Deployment | Render/Railway (Backend), Vercel (Frontend) |

---

## 📁 Project Structure

```

BookWise/
│── backend/
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │    ├── User.js
│   │    ├── Provider.js
│   │    ├── Appointment.js
│   ├── routes/
│   │    ├── authRoutes.js
│   │    ├── providerRoutes.js
│   │    ├── appointmentRoutes.js
│   ├── .env.example
│   ├── server.js
│── frontend/
│   ├── src/
│   │    ├── main.jsx
│   │    ├── App.jsx
│   │    ├── components/
│   │         ├── ProviderSelector.jsx
│   │         ├── ServiceTypeSelector.jsx
│   │         ├── Calendar.jsx
│   │         ├── AdminPanel.jsx
│   │         ├── MyBookings.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│── README.md

````

---

## 🔧 Setup & Installation (Windows – VS Code)

### 1️⃣ Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/bookwise.git
````

### 2️⃣ Backend start

```bash
cd backend
copy .env.example .env   # Fill your own credentials here
npm install
npm run dev
```

### 3️⃣ Seed provider (run once)

Open in browser or Postman:

```
GET http://localhost:5000/api/providers/seed
```

### 4️⃣ Frontend start

```bash
cd frontend
npm install
npm run dev
```

### 5️⃣ Open UI in browser

```
http://localhost:5173
```

---

## 🔑 Create Admin User

1. Register normally using frontend (Sign Up)
2. In MongoDB Atlas/Compass change:

```
"role": "admin"
```

3. Logout → Login again → Admin panel appears!

---

## 📡 API Endpoints (Test Using Postman)

| Method | Endpoint                         | Body / Params                                    |
| ------ | -------------------------------- | ------------------------------------------------ |
| POST   | `/api/auth/register`             | `{ "name","email","password","role(optional)" }` |
| POST   | `/api/auth/login`                | `{ "email","password" }`                         |
| GET    | `/api/providers`                 | –                                                |
| GET    | `/api/providers/seed`            | –                                                |
| GET    | `/api/appointments/availability` | `?providerId=&date=&serviceType=`                |
| POST   | `/api/appointments/book`         | `{ "providerId","date","time","serviceType" }`   |
| GET    | `/api/appointments/my`           | *(JWT Required)*                                 |
| GET    | `/api/appointments/admin/list`   | `?providerId=&date=` *(Admin + JWT Required)*    |
| PATCH  | `/api/appointments/cancel/:id`   | *(Admin OR Owner + JWT Required)*                |

> Add `Authorization: Bearer <token>` header for protected routes.

---

## 🔐 Environment Variable Guide

Do NOT commit real `.env` file. Use `.env.example` instead:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_URI
PORT=5000
JWT_SECRET=YOUR_RANDOM_SECRET
```

```

---

## ⭐ If you like this project, don't forget to star the repo!
```

#  University Data App

A full-stack application for managing university datasets, analysis, payments, and API access — built with React, Node.js, Express, and Prisma ORM.

---

##  Features

###  Student
- Register & verify via OTP
- Upload datasets (images)
- View own uploads, colors, and analysis
- Make simulated payments & receive API keys

###  Professor
- View all student datasets
- Assign color codes to each dataset
- Review final analysis values

###  Admin
- Manage all users (block/unblock, promote)
- View and revoke API keys
- View all payment transactions
- Inspect all uploaded datasets
- Dashboard overview (users, datasets, payments, keys)

---

##  Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | Prisma ORM + SQLite/MySQL |
| Auth | JWT + Email OTP |
| File Uploads | Multer |
| Mailing | Nodemailer (Email OTPs) |

---

##  Installation Guide

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ahsanmoizz/university-data-app.git
cd university-data-app

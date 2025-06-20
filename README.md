# 🎉 CelebrateMate

**CelebrateMate** is a full-stack web application that automatically reminds users of birthdays and anniversaries via SMS and email. It allows users to manage personal events and contact-related events, with powerful reminder settings and a clean, modern UI.

---

## 🌟 Features

- 👤 User Authentication (Sign Up / Login)
- 📅 Create and Manage Events (Birthdays, Anniversaries, Custom Events)
- 📇 Contact Management with Event-based Reminders
- 🔔 Custom Reminder Settings (e.g., 1 day, 2 days before)
- 📬 Automatic Email & SMS Notifications
- 📊 Dashboard with Event Statistics & Upcoming Events
- 💻 Responsive UI with Tailwind CSS
- 🧠 Smart Event Merging Logic (User + Contact events)
- 🔐 Secure API with JWT
- 🗓️ Daily Cron Jobs for Sending Reminders

---

## 🛠️ Tech Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| **Frontend**     | HTML, CSS, JavaScript, Tailwind CSS |
| **Backend**      | Node.js, Express.js           |
| **Database**     | MySQL / MariaDB               |
| **Email Service**| Nodemailer                    |
| **SMS Service**  | (e.g., Twilio / Custom API)   |
| **Scheduler**    | node-cron                     |
| **Date Utility** | dayjs                         |

---

## 📸 Screenshots

> Replace these placeholder links with real screenshots

- **Dashboard:**  
  ![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

- **Event Form:**  
  ![Event Form](https://via.placeholder.com/800x400?text=Event+Form+Screenshot)

- **Reminder Settings:**  
  ![Reminder](https://via.placeholder.com/800x400?text=Reminder+Settings+Screenshot)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Prasad-rangapu/CelebrateMate.git
cd CelebrateMate

###2️⃣ Install Dependencies
```bash
npm install

###3️⃣ Configure Environment Variables

Create a .env file in the root directory of your project and add the following:
```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=celebratemate
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password


###4️⃣ Start the Server

Run:


```bash
npm run dev
This will start your backend server at
```bash
http://localhost:5000.

###5️⃣ Setup Reminder Cron Job (Optional)

To send email reminders daily at 8:30 PM, add this cron job in your main server file (server.ts


Open terminal in the project folder and run:

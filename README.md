# 🔁 FLA – Flow-Trigger-Auto

## 🧩 What is FLA?

**FLA (Flow-Trigger-Auto)** is a full-stack, visual automation builder for communication workflows. Design flows like:

- When someone fills out a form,
- Send them an email or SMS,
- Wait a few minutes,
- Send another message,
- Or branch based on their data.

Built with [React Flow](https://reactflow.dev/) (frontend) and Laravel (backend).

---

## 🚀 Quick Start

> **Note:** You must run the database seeder after migrations to use the app's features.

### 1. **Clone the Repository**

```bash
git clone https://github.com/GregTrifan/flow-trigger-auto.git
cd flow-trigger-auto
```

### 2. **Start Docker Services**

```bash
docker-compose up -d
```

This launches:

- MySQL (with schema/init scripts from `docker/mysql/init/`)
- Mailhog (for email testing)
- Redis (for queues/caching)

### 3. **Set Up Environment**

```bash
cp .env.example .env
```

Edit `.env` if needed (DB, mail, etc. should match Docker defaults, You should also add your Twilio config vars).

### 4. **Install Dependencies**

```bash
composer install
npm install
```

### 5. **Generate App Key**

```bash
php artisan key:generate
```

### 6. **Run Migrations**

```bash
php artisan migrate
```

### 7. **Seed the Database (Required)**

```bash
php artisan db:seed
```

> **Seeding is required for the app to have initial flows and features.**

### 8. **Start the App**

```bash
php artisan serve
npm run dev
php artisan queue:listen # watches for background jobs
```

- Visit: [http://localhost:8000](http://localhost:8000)
- Mailhog UI: [http://localhost:8025](http://localhost:8025)

---

## �� Key App URLs

Here's where you'll find the main features, ready to explore:

- **Workflow Builder:** [`/dashboard/workflow`](http://localhost:8000/dashboard/workflow)
    - Design, edit, and visualize your automation flow.
- **Execution History:** [`/dashboard/executions`](http://localhost:8000/dashboard/executions)
    - Track every run, step by step.
- **Contact Form:** [`/`](http://localhost:8000/)
    - Here you can try out the form trigger and see your flows in action.

---

## 🧱 Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | React + Vite + React Flow |
| Backend     | Laravel (API & Jobs)      |
| Database    | MySQL (Docker)            |
| Email       | SMTP (Mailhog, Gmail)     |
| SMS         | Twilio API                |
| Queue/Cache | Redis (Docker)            |

---

## 🐳 Docker Services

| Service | Host/Port      | Notes                                                |
| ------- | -------------- | ---------------------------------------------------- |
| MySQL   | localhost:3306 | DB: `fla_db`, User: `fla_user`, Pass: `fla_password` |
| Mailhog | localhost:8025 | Email testing UI                                     |
| Redis   | localhost:6379 | Queue/cache                                          |

---

## ✨ Example Flow

```
[Form Submit]
    ↓
[IF phone exists]
    ↓ YES                      ↓ NO
[Wait 5 min]              [Send Email]
    ↓
[Send SMS]
```

All logic is visually constructed, stored in the DB, and executed by the backend.

---

## 🔒 Authentication

> **Note:** In production, all flow/execution endpoints should be protected by authentication middleware.

---

## 📝 Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (deletes all data!)
docker-compose down -v
docker-compose up -d
```

---

## 💡 Use Cases

- Lead generation forms with automated follow-ups
- CRM-like communication flows
- SMS/email drip campaigns
- Visual demo of marketing automation logic

---

## ⚠️ Known Quirks

- **Edge Animation:** All "recently saved" edges animate when there are unsaved changes in the flow editor. (Future: per-edge animation.)

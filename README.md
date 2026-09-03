# Nuru Construction Hub

A marketplace platform connecting clients with construction professionals (architects,
contractors, electricians, plumbers, etc.) and material suppliers (hardware/electrical
stores), built with React + Node/Express + MongoDB.

This is a **validation-stage MVP**. It deliberately excludes payments, real-time chat,
notifications, and AI features — contact between clients and professionals/stores happens
via direct phone call or WhatsApp.

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** Custom JWT authentication (bcrypt password hashing) — no third-party auth provider
- **Image Uploads:** Cloudinary

---

## Project Structure

```
nuru-construction-hub/
├── backend/              # Express API
│   ├── config/           # DB, Cloudinary, shared constants
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # Auth, upload, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── utils/             # JWT helper, DB seed script
│   ├── app.js
│   ├── server.js
│   └── .env.example
│
└── frontend/              # React app
    ├── src/
    │   ├── api/            # Axios service modules (one per resource)
    │   ├── components/     # Reusable + feature components
    │   ├── context/        # AuthContext (global auth state)
    │   ├── pages/           # Route-level pages, incl. dashboards
    │   └── utils/           # Helper functions (WhatsApp links, formatting)
    └── .env.example
```

---

## Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string (or local MongoDB)
- A Cloudinary account (cloud name, API key, API secret)

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your real values:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nuru-construction-hub?retryWrites=true&w=majority

JWT_SECRET=<generate a long random string>
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>

CLIENT_URL=http://localhost:5173
```

> Tip: generate a strong `JWT_SECRET` with:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**Seed the database** (creates an admin account + the official Nuru Electricals profile
and store, which power the "Recommended Partner" priority-display feature):

```bash
npm run seed
```

This creates:
- Admin login: `admin@nuruconstructionhub.com` / `Admin@123`
- Nuru Electricals login: `info@nuruelectricals.com` / `Nuru@1234`

**Start the backend:**

```bash
npm run dev
```

The API will run at `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` already points to `http://localhost:5000/api`, which matches the
backend default. Adjust `VITE_API_URL` only if you changed the backend port.

**Start the frontend:**

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

---

## Using the App

1. Visit `http://localhost:5173` and register as a **Client**, **Professional**, or
   **Store Owner**.
2. **Professionals** are redirected to `/dashboard/professional` to complete their
   profile (profession, bio, location, profile/cover photos, portfolio).
3. **Store Owners** are redirected to `/dashboard/store` to set up their store profile
   and start adding products.
4. **Clients** can browse `/professionals`, `/materials`, and `/jobs`, and contact
   professionals/stores directly via the Call or WhatsApp buttons on each profile.
5. Log in as the seeded admin account to access `/dashboard/admin` and manage users,
   professionals, stores, products, and jobs.

### Nuru Electricals Priority Display

The official **Nuru Electricals** account (created by the seed script) is flagged with
`isNuruElectricals: true` on its Professional and Store records. Whenever a search or
filter matches a priority keyword (`electrician`, `electrical`, `solar`, `cctv`,
`electric fence`, `security`), the backend automatically sorts Nuru Electricals to the
top of the results and the frontend displays a "Recommended Partner" badge. Any products
Nuru Electricals uploads under the "Electrical" category are similarly flagged as
featured (`isFeaturedNuru`) and surfaced first in materials search results.

---

## Notes

- All image uploads (profile photos, cover photos, portfolio images, store logos,
  product images) go through Cloudinary via the backend's upload middleware.
- WhatsApp buttons use the `wa.me` deep-link format with the exact pre-filled messages
  specified in the project requirements.
- This MVP intentionally has no internal messaging, notifications, payments, real-time
  features, or AI — all contact happens via direct call/WhatsApp.
- Never commit your real `.env` files — both `backend/.gitignore` and standard practice
  exclude them, but double-check before pushing to any repository.

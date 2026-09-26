# Job-O-Hire Backend — Setup Guide

Stack: **Node.js + Express + MongoDB (Mongoose) + JWT (httpOnly cookies) + Cloudinary + Multer**.

---

## 1. Prerequisites

- Node.js v18+ (`node -v`)
- npm v9+
- A MongoDB Atlas account (free tier is fine) — https://cloud.mongodb.com
- A Cloudinary account (free tier) for resume / photo / logo uploads — https://cloudinary.com

---

## 2. Database setup (MongoDB Atlas — 5 minutes)

1. Sign in at https://cloud.mongodb.com.
2. **Build a Database → M0 (Free)**, pick a region, click **Create**.
3. **Database Access** → Add user → username/password (write it down).
4. **Network Access** → Add IP → `0.0.0.0/0` for development (restrict in prod).
5. **Connect → Drivers → Node.js** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your real password and add a database name before the `?`:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
   ```
   This will be your `MONGO_URI`.

---

## 3. Cloudinary setup (2 minutes)

1. Sign in at https://console.cloudinary.com.
2. Dashboard → **Account Details** card → copy `Cloud name`, `API Key`, `API Secret`.
3. These map to `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`.

---

## 4. Environment variables

```bash
cd backend
cp .env.example .env       # Windows PowerShell: Copy-Item .env.example .env
```

Generate a strong JWT secret and paste it into `.env` as `SECRET_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then fill in the rest of `.env`:

| Key | Where to get it |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `SECRET_KEY` | Output of the `node -e` command above |
| `JWT_EXPIRY` | e.g. `1d`, `7d` — leave default if unsure |
| `PORT` | `8000` (must match `BASE` in `frontend/src/utils/constant.js`) |
| `NODE_ENV` | `development` locally, `production` on deploy |
| `FRONTEND_URL` | `http://localhost:5173` for Vite dev. Comma-separate for multiple. |
| `CLOUDINARY_*` | Cloudinary dashboard |
| `SMTP_*` | (Optional) Gmail App Password or SendGrid — only if you wire up email |

> The `.env` file is git-ignored. **Never commit it.**

---

## 5. Install & run

```bash
cd backend
npm install
npm run seed          # Creates test users + companies + jobs
npm run dev           # Starts the API at http://localhost:8000
```

You should see:
```
Server running on http://localhost:8000
Allowed CORS origins: http://localhost:5173
MongoDB connected successfully
```

Health check: `curl http://localhost:8000/healthz` → `{ "ok": true, ... }`

### Test credentials (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Student | `student@jobohire.com` | `test1234` |
| Recruiter | `recruiter@jobohire.com` | `test1234` |

---

## 6. Run the frontend

```bash
cd ../frontend
npm install
npm run dev           # Vite at http://localhost:5173
```

Open http://localhost:5173, click **Login**, use the seeded credentials.

---

## 7. API surface (matches frontend)

Base URL: `http://localhost:8000/api/v1`

### Auth & user (`/user`)
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| `POST` | `/register` | – | `multipart`: `fullname, email, phoneNumber, password, role`, optional `file` (profile photo) |
| `POST` | `/login` | – | `{ email, password, role }` → sets `token` cookie |
| `GET`  | `/logout` | – | clears cookie |
| `POST` | `/profile/update` | ✅ | `multipart`: any of `fullname, email, phoneNumber, bio, skills, customSkills, gender, personalEmail, college, graduationYear, externalLinks (JSON)`, optional `file` (resume) |
| `POST` | `/profile/photo` | ✅ | `multipart`: `file` |
| `POST` | `/profile/resume` | ✅ | `multipart`: `file`, body `resumeType: "master" | "domain"` |
| `DELETE` | `/profile/resume/:resumeId` | ✅ | – |
| `GET`  | `/notifications` | ✅ | – |
| `PUT`  | `/notifications/read` | ✅ | marks all as read |
| `GET`  | `/dashboard/stats` | ✅ | aggregated user stats |

### Jobs (`/job`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/post` | ✅ recruiter | `{ title, description, requirements, salary, location, jobType, experience, position, companyId }` |
| `GET`  | `/get?keyword=` | ✅ | regex search on title/description |
| `GET`  | `/get/:id` | ✅ | populates `applications` |
| `GET`  | `/getadminjobs` | ✅ recruiter | jobs created by current user |

### Applications (`/application`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET`  | `/apply/:id` | ✅ | apply to job (idempotent: rejects duplicate) |
| `GET`  | `/get` | ✅ | applications by current user |
| `GET`  | `/:id/applicants` | ✅ recruiter | populates `applications.applicant` |
| `POST` | `/status/:id/update` | ✅ recruiter | `{ status: "pending"|"accepted"|"rejected" }` |

### Companies (`/company`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/register` | ✅ | `{ companyName }` |
| `GET`  | `/get` | ✅ | companies owned by current user |
| `GET`  | `/get/:id` | ✅ | – |
| `PUT`  | `/update/:id` | ✅ | `multipart`: `name, description, website, location`, optional `file` (logo) |

### Internships (`/internship`)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/post` | ✅ |
| `GET`  | `/get?keyword=&location=&status=` | ✅ |
| `GET`  | `/get/:id` | ✅ |
| `GET`  | `/admin` | ✅ |

### Interviews (`/interview`)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/create` | ✅ |
| `GET`  | `/my` | ✅ — returns `{ upcoming, past }` |
| `PUT`  | `/:id/status` | ✅ |

### Testimonials (`/testimonial`)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/create` | ✅ |
| `GET`  | `/get` | – (public, only approved) |
| `PUT`  | `/approve/:id` | ✅ |

### Bookmarks (`/bookmark`)
| Method | Path | Auth |
|---|---|---|
| `PUT`  | `/toggle/:id` | ✅ |
| `GET`  | `/get` | ✅ |

### Health
| Method | Path | Notes |
|---|---|---|
| `GET`  | `/healthz` | Liveness probe |

All responses follow `{ success: boolean, message?: string, ...payload }`.

---

## 8. Smoke testing with cURL

```bash
# 1. Register a student (file optional)
curl -X POST http://localhost:8000/api/v1/user/register \
  -F "fullname=Jane" -F "email=jane@example.com" \
  -F "phoneNumber=9000000000" -F "password=secret123" -F "role=student"

# 2. Login (capture cookie jar)
curl -c cookies.txt -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@jobohire.com","password":"test1234","role":"student"}'

# 3. Authenticated request
curl -b cookies.txt http://localhost:8000/api/v1/user/dashboard/stats

# 4. List jobs
curl -b cookies.txt "http://localhost:8000/api/v1/job/get?keyword=react"
```

---

## 9. Deploying

- Render / Railway / Fly: set the same env vars there. Use `npm start` as the start command.
- Set `NODE_ENV=production` (this enables `secure` + `sameSite=none` on the auth cookie).
- Add your deployed frontend URL to `FRONTEND_URL` (comma-separated for multiple).
- Phones often drop that cross-site cookie. Login also returns the JWT, and the web app keeps it in `sessionStorage` (not `localStorage`) and sends `Authorization: Bearer` on later requests. You do not need to clear site data after a deploy for login to work.
- To open the dev app from a phone on the same Wi-Fi, run the Vite server and visit `http://<laptop-ip>:5173`. Dev traffic goes through the `/api` proxy, so the phone does not call its own `localhost`. If you point the phone at the API host directly instead, add that page origin to `FRONTEND_URL`.
- For MongoDB Atlas, replace the `0.0.0.0/0` Network Access rule with your host's egress IPs.

---

## 10. Security checklist

- [x] Secrets in `.env`, not in source
- [x] Passwords hashed with bcrypt (10 rounds)
- [x] JWT in httpOnly cookie, plus a `sessionStorage` bearer fallback when a phone drops the cross-site cookie (not `localStorage`)
- [x] CORS whitelist via env, with `credentials: true`
- [x] Helmet enabled
- [x] Rate limiting on `/login` and `/register`
- [x] Global error handler, no stack traces in production
- [ ] Email verification flow (TODO)
- [ ] Password reset flow (TODO)
- [ ] Role-based middleware on recruiter-only routes (TODO — currently checked client-side only)

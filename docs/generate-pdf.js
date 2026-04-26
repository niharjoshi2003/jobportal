/**
 * Generates docs/Job-O-Hire-Architecture.pdf documenting the system.
 *
 * Run from repo root:    node docs/generate-pdf.js
 * Run from backend dir:  node ../docs/generate-pdf.js
 *
 * Uses the pdfkit dependency that already lives in backend/node_modules
 * (already used by application.controller.js for resume previews).
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.join(__dirname, "Job-O-Hire-Architecture.pdf");

// ---------- styling helpers ----------
const COLORS = {
    primary: "#7c3aed",
    accent: "#ec4899",
    text: "#0f172a",
    muted: "#475569",
    border: "#cbd5e1",
    bgSoft: "#f1f5f9",
    code: "#0b1021",
    codeText: "#e2e8f0",
    success: "#16a34a",
    warning: "#d97706",
};

const doc = new PDFDocument({
    size: "A4",
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
        Title: "Job-O-Hire — System Architecture & Operations Guide",
        Author: "Job-O-Hire Engineering",
        Subject: "How the system works, end-to-end",
    },
});

doc.pipe(fs.createWriteStream(OUT));

// Page header/footer - draw via pageAdded, but carefully so we don't
// re-trigger pagination from within the handler.
let pageNumber = 0;
let drawingChrome = false;

doc.on("pageAdded", () => {
    pageNumber++;
    if (drawingChrome) return;
    drawingChrome = true;
    const savedY = doc.y;
    drawHeader();
    drawFooter();
    doc.y = savedY;
    drawingChrome = false;
});

function drawHeader() {
    const y = 25;
    doc.save();
    // Left text
    doc.fillColor(COLORS.primary).fontSize(9).font("Helvetica-Bold")
        .text("JOB-O-HIRE", 60, y, { lineBreak: false, width: 200 });
    // Right text
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9)
        .text("System Architecture & Operations Guide",
            doc.page.width - 360, y,
            { lineBreak: false, width: 300, align: "right" });
    doc.moveTo(60, y + 14).lineTo(doc.page.width - 60, y + 14)
        .strokeColor(COLORS.border).lineWidth(0.5).stroke();
    doc.restore();
}

function drawFooter() {
    const y = doc.page.height - 35;
    doc.save();
    doc.moveTo(60, y).lineTo(doc.page.width - 60, y)
        .strokeColor(COLORS.border).lineWidth(0.5).stroke();
    doc.fillColor(COLORS.muted).fontSize(8).font("Helvetica")
        .text(`Page ${pageNumber}`, 60, y + 6, {
            width: doc.page.width - 120,
            align: "center",
            lineBreak: false,
        });
    doc.restore();
}

// Draw chrome on the first (already-existing) page manually.
pageNumber = 1;
drawingChrome = true;
drawHeader();
drawFooter();
drawingChrome = false;

function h1(text) {
    ensureSpace(60);
    doc.moveDown(0.5);
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(20).text(text);
    doc.moveTo(doc.x, doc.y + 2).lineTo(doc.x + 60, doc.y + 2)
        .lineWidth(2).strokeColor(COLORS.accent).stroke();
    doc.moveDown(0.6);
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(11);
}

function h2(text) {
    ensureSpace(40);
    doc.moveDown(0.4);
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(14).text(text);
    doc.moveDown(0.2);
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(11);
}

function h3(text) {
    ensureSpace(24);
    doc.moveDown(0.3);
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(11).text(text);
    doc.moveDown(0.1);
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(10.5);
}

function p(text) {
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(10.5).text(text, {
        align: "left",
        lineGap: 2,
    });
    doc.moveDown(0.4);
}

function bullets(items) {
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(10.5);
    for (const item of items) {
        ensureSpace(20);
        const startY = doc.y;
        doc.circle(doc.page.margins.left + 4, startY + 6, 1.8).fillColor(COLORS.accent).fill();
        doc.fillColor(COLORS.text).text(item, doc.page.margins.left + 14, startY, {
            width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 14,
            lineGap: 2,
        });
        doc.moveDown(0.15);
    }
    doc.moveDown(0.3);
}

function code(lines) {
    const text = Array.isArray(lines) ? lines.join("\n") : lines;
    const padding = 8;
    const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.font("Courier").fontSize(9);
    const height = doc.heightOfString(text, { width: usable - padding * 2 }) + padding * 2;
    ensureSpace(height + 6);
    const y = doc.y;
    doc.save();
    doc.roundedRect(doc.page.margins.left, y, usable, height, 4)
        .fillColor(COLORS.code).fill();
    doc.fillColor(COLORS.codeText).font("Courier").fontSize(9)
        .text(text, doc.page.margins.left + padding, y + padding, { width: usable - padding * 2 });
    doc.restore();
    doc.y = y + height + 6;
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text);
}

function callout(label, text, color = COLORS.primary) {
    const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.font("Helvetica").fontSize(10);
    const padding = 8;
    const innerWidth = usable - padding * 2 - 4;
    const labelHeight = 14;
    const bodyHeight = doc.heightOfString(text, { width: innerWidth });
    const total = labelHeight + bodyHeight + padding * 2;
    ensureSpace(total + 6);
    const y = doc.y;
    doc.save();
    doc.roundedRect(doc.page.margins.left, y, usable, total, 4)
        .fillColor(COLORS.bgSoft).fill();
    doc.rect(doc.page.margins.left, y, 4, total).fillColor(color).fill();
    doc.fillColor(color).font("Helvetica-Bold").fontSize(9)
        .text(label.toUpperCase(), doc.page.margins.left + padding + 4, y + padding, { width: innerWidth });
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(10)
        .text(text, doc.page.margins.left + padding + 4, y + padding + labelHeight, { width: innerWidth });
    doc.restore();
    doc.y = y + total + 6;
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(10.5);
}

function table(headers, rows, colWidths) {
    const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    if (!colWidths) {
        const w = usable / headers.length;
        colWidths = headers.map(() => w);
    }
    const drawRow = (cells, isHeader) => {
        doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9.5);
        const heights = cells.map((c, i) =>
            doc.heightOfString(String(c), { width: colWidths[i] - 8 })
        );
        const rowH = Math.max(...heights) + 8;
        ensureSpace(rowH + 2);
        let x = doc.page.margins.left;
        const y = doc.y;
        if (isHeader) {
            doc.save();
            doc.rect(x, y, usable, rowH).fillColor(COLORS.primary).fill();
            doc.restore();
        }
        cells.forEach((c, i) => {
            doc.fillColor(isHeader ? "#ffffff" : COLORS.text)
                .text(String(c), x + 4, y + 4, { width: colWidths[i] - 8 });
            x += colWidths[i];
        });
        doc.moveTo(doc.page.margins.left, y + rowH)
            .lineTo(doc.page.margins.left + usable, y + rowH)
            .strokeColor(COLORS.border).lineWidth(0.4).stroke();
        doc.y = y + rowH;
    };
    drawRow(headers, true);
    rows.forEach(r => drawRow(r, false));
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text);
}

function ensureSpace(needed) {
    const limit = doc.page.height - doc.page.margins.bottom;
    if (doc.y + needed > limit) doc.addPage();
}

// ============================================================
// COVER PAGE
// ============================================================
function coverPage() {
    doc.save();
    doc.rect(0, 0, doc.page.width, doc.page.height).fillColor("#0b1021").fill();

    doc.rect(0, 0, doc.page.width, 6).fillColor(COLORS.accent).fill();

    doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(11)
        .text("ENGINEERING DOCUMENTATION", 60, 160, { characterSpacing: 2 });

    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(40)
        .text("Job-O-Hire", 60, 200);

    doc.fillColor("#cbd5e1").font("Helvetica").fontSize(18)
        .text("System Architecture & Operations Guide", 60, 252);

    doc.moveTo(60, 320).lineTo(180, 320).strokeColor(COLORS.accent).lineWidth(2).stroke();

    doc.fillColor("#cbd5e1").font("Helvetica").fontSize(11)
        .text("A full-stack job & internship marketplace built on the MERN stack with role-based access control for students, recruiters, and platform admins.", 60, 340, { width: doc.page.width - 120, lineGap: 4 });

    // Stats / metadata box
    doc.roundedRect(60, 460, doc.page.width - 120, 140, 8).strokeColor(COLORS.accent).lineWidth(1).stroke();

    const cellW = (doc.page.width - 120) / 2;
    const items = [
        ["Stack", "MongoDB · Express · React · Node.js"],
        ["Frontend", "Vite + React 18 + Redux + TailwindCSS + shadcn/ui"],
        ["Backend", "Node.js + Express + Mongoose + JWT cookies"],
        ["Storage", "MongoDB Atlas + Cloudinary (logos & resumes)"],
        ["Roles", "student · recruiter · admin"],
        ["Doc generated", new Date().toLocaleDateString()],
    ];
    items.forEach((row, idx) => {
        const col = idx % 2;
        const r = Math.floor(idx / 2);
        const x = 60 + col * cellW + 16;
        const y = 480 + r * 36;
        doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(8)
            .text(row[0].toUpperCase(), x, y, { characterSpacing: 1 });
        doc.fillColor("#ffffff").font("Helvetica").fontSize(10).text(row[1], x, y + 12);
    });

    doc.fillColor("#475569").font("Helvetica").fontSize(8)
        .text("Generated by docs/generate-pdf.js", 60, doc.page.height - 60, {
            width: doc.page.width - 120,
            align: "center",
        });
    doc.restore();
}

coverPage();
// Cover page uses its own dark background; header/footer chrome was already
// drawn before we painted over it. That's fine — the dark fill covers it and
// the cover ends up clean. Now move to a fresh page for content; pageAdded
// will draw the standard header/footer there.
doc.addPage();

// ============================================================
// 1. EXECUTIVE SUMMARY
// ============================================================
h1("1. Executive Summary");
p("Job-O-Hire is a full-stack web application that connects three distinct user types: students looking for jobs and internships, recruiters who post openings on behalf of their company, and platform administrators (super-admins) who moderate the entire site.");
p("The application is delivered as a single-page React frontend backed by a stateless Express REST API. Authentication uses HTTP-only JWT cookies. Persistent data lives in MongoDB Atlas; binary assets (company logos, candidate resumes) are uploaded to Cloudinary.");

callout("What changed in v2",
    "Phase 1 introduced an admin role and split internships into a fully-separate domain with its own model, controllers, and apply-state. Phase 2 added a super-admin console for moderating users, companies (with verification approval), jobs, and internships.");

bullets([
    "Three first-class user roles with strict role-based authorization on every mutation route.",
    "Two separate application pipelines — Job Applications and Internship Applications — each with its own status state machine.",
    "Company verification workflow: a recruiter can post freely, but admins can flag companies as Verified to build trust.",
    "Admin console with site-wide stats, user management, company approval, and job/internship moderation.",
]);

// ============================================================
// 2. SYSTEM ARCHITECTURE
// ============================================================
h1("2. System Architecture");

h2("2.1 High-level diagram");
code([
    "+---------------------+        +-----------------------+",
    "|   Browser (React)   |  HTTPS |   Express API server  |",
    "|   Vite + Redux      | <----> |   /api/v1/*           |",
    "|   Tailwind / shadcn |  JWT   |   isAuthenticated     |",
    "+----------+----------+ cookie |   authorize(roles)    |",
    "           |                   +-----+------------+----+",
    "           |                         |            |",
    "           |                         v            v",
    "           |                  +-------------+  +-----------+",
    "           |                  | MongoDB     |  | Cloudinary|",
    "           |                  | Atlas       |  | (logos +  |",
    "           |                  | (Mongoose)  |  |  resumes) |",
    "           |                  +-------------+  +-----------+",
    "           v",
    "  Static assets served by Vite dev server (5173) in dev,",
    "  or any static host in production.",
]);

h2("2.2 Request lifecycle (typical authenticated call)");
bullets([
    "User triggers an action in React → axios sends a request with `withCredentials: true`.",
    "Express receives the request; `cookieParser()` extracts the JWT from `req.cookies.token`.",
    "`isAuthenticated` verifies the JWT, loads the User document, and attaches `req.user`.",
    "`authorize(...allowedRoles)` checks `req.user.role` against the permitted roles.",
    "Controller executes business logic, talks to Mongoose models, and responds with JSON.",
    "React updates Redux state via dispatched actions; the affected page re-renders.",
]);

h2("2.3 Folder layout");
code([
    "jobportal/",
    "├── backend/                    Node.js + Express API",
    "│   ├── controllers/            Business logic per resource",
    "│   ├── middlewares/            isAuthenticated, authorize, multer",
    "│   ├── models/                 Mongoose schemas",
    "│   ├── routes/                 Route → controller wiring",
    "│   ├── utils/                  db.js, cloudinary.js, datauri.js",
    "│   └── index.js                Server bootstrap",
    "├── frontend/                   Vite + React SPA",
    "│   └── src/",
    "│       ├── components/         Pages and UI components",
    "│       │   ├── auth/           Login, Signup",
    "│       │   ├── admin/          Recruiter views",
    "│       │   │   └── superadmin/ Admin-only console",
    "│       │   ├── internships/    Student-facing internship pages",
    "│       │   ├── jobs/           Student-facing jobs page",
    "│       │   └── layout/         DashboardLayout, Sidebar, Header",
    "│       ├── hooks/              Data-fetch hooks (Redux side-effects)",
    "│       ├── redux/              Slices + store",
    "│       └── utils/constant.js   API base URLs",
    "├── docs/                       This PDF + generator script",
    "└── setup.bat                   One-click dev bootstrap",
]);

// ============================================================
// 3. ROLES & AUTH
// ============================================================
h1("3. Roles & Authentication");

h2("3.1 Three roles");
table(
    ["Role", "Can do", "Cannot do"],
    [
        ["student", "Browse jobs/internships, apply, bookmark, track status, manage profile + resume", "Post jobs, manage companies, access admin console"],
        ["recruiter", "Register & manage own companies, post jobs/internships, view applicants, change applicant status", "Manage other recruiters' companies, moderate users, verify companies"],
        ["admin", "Everything a recruiter can do PLUS site-wide moderation: manage users, verify/delete companies, delete any job/internship, view stats", "Demote themselves (guarded), delete themselves via admin tools"],
    ],
    [80, 240, 155]
);

h2("3.2 Sign-up flow");
p("Students and recruiters self-register. Choosing role=admin requires the secret ADMIN_SIGNUP_CODE configured in backend/.env. Without the correct code the request is rejected with HTTP 403 — admins cannot be created from the UI alone.");

code([
    "POST /api/v1/user/register",
    "{",
    "  \"fullname\":     \"Jane Doe\",",
    "  \"email\":        \"jane@example.com\",",
    "  \"phoneNumber\":  \"9876543210\",",
    "  \"password\":     \"********\",",
    "  \"role\":         \"admin\",",
    "  \"adminCode\":    \"<value of ADMIN_SIGNUP_CODE>\"",
    "}",
]);

callout("Bootstrapping the first admin",
    "Set ADMIN_SIGNUP_CODE in backend/.env, restart the server, sign up once with role=admin, then ROTATE THE SECRET. Treat it like a password.");

h2("3.3 Login & sessions");
bullets([
    "POST /api/v1/user/login validates credentials and returns an HTTP-only cookie named `token` (a signed JWT).",
    "JWT payload: `{ userId }`. Expiry comes from `JWT_EXPIRY` (default 1d).",
    "On every protected request, `isAuthenticated` decodes the JWT and reloads the User from MongoDB so role checks always reflect the latest data.",
    "Logout clears the cookie via `GET /api/v1/user/logout`.",
]);

h2("3.4 Authorization middleware");
code([
    "// backend/middlewares/authorize.js",
    "const authorize = (...allowedRoles) => (req, res, next) => {",
    "    if (!req.user) return res.status(401).json({ ... });",
    "    if (!allowedRoles.includes(req.user.role))",
    "        return res.status(403).json({ ... });",
    "    next();",
    "};",
]);
p("Applied to every mutation route, e.g.:");
code([
    "router.post(\"/post\",",
    "    isAuthenticated,",
    "    authorize(\"recruiter\", \"admin\"),",
    "    postJob);",
    "",
    "router.use(isAuthenticated, authorize(\"admin\"));   // admin.route.js",
]);

// ============================================================
// 4. DOMAIN MODEL
// ============================================================
h1("4. Domain Model");

h2("4.1 Entity relationship overview");
code([
    "User (1) ───── owns ─────> (N) Company",
    "Company (1) ── has ──────> (N) Job",
    "Company (1) ── has ──────> (N) Internship",
    "User/student (1) ── files ─> (N) Application       ──> Job",
    "User/student (1) ── files ─> (N) InternshipApplication ──> Internship",
    "User (1) ──── stores ────> (N) Bookmark",
]);

h2("4.2 Schema highlights");
table(
    ["Model", "Key fields"],
    [
        ["User", "fullname, email (unique), phoneNumber, password (hashed), role[student|recruiter|admin], profile{ bio, skills, resume, profilePhoto, ... }"],
        ["Company", "name (unique), description, website, location, logo, industry[], companyType, country, culture, userId→User, verified, verifiedAt, verifiedBy→User"],
        ["Job", "title, description, requirements[], salary, experienceLevel, location, jobType, position, deadline, duration{value,unit}, eligibility[], tags[], company→Company, created_by→User, applications[]→Application"],
        ["Internship", "title, description, compensation{type,amount,currency}, duration, eligibility, location, locationType, deadline, status[open|closed], company→Company, created_by→User, applications[]→InternshipApplication"],
        ["Application", "job→Job, applicant→User, status[pending|shortlisted|accepted|rejected]"],
        ["InternshipApplication", "internship→Internship, applicant→User, status[pending|shortlisted|accepted|rejected], unique index on (internship, applicant)"],
        ["Bookmark", "user→User, target type+id (job or internship)"],
    ],
    [110, 365]
);

callout("Why two Application models?",
    "An earlier version reused a single Application schema for both jobs and internships. That broke the 'have I applied?' check — applying to a job appeared as having applied to an internship and vice versa. Splitting the models guarantees independent state machines and cleaner queries.", COLORS.warning);

// ============================================================
// 5. BACKEND API
// ============================================================
h1("5. Backend API Reference");
p("All endpoints are prefixed with /api/v1. Authentication uses the `token` HTTP-only cookie. Bracketed roles indicate who may call the endpoint.");

h2("5.1 User & auth");
table(
    ["Method", "Path", "Roles"],
    [
        ["POST",   "/user/register", "public"],
        ["POST",   "/user/login", "public"],
        ["GET",    "/user/logout", "any"],
        ["POST",   "/user/profile/update", "any (self)"],
    ],
    [60, 280, 195]
);

h2("5.2 Company");
table(
    ["Method", "Path", "Roles"],
    [
        ["POST",   "/company/register", "recruiter, admin"],
        ["GET",    "/company/get", "any"],
        ["GET",    "/company/get/:id", "any"],
        ["PUT",    "/company/update/:id", "recruiter, admin"],
    ],
    [60, 280, 195]
);

h2("5.3 Jobs");
table(
    ["Method", "Path", "Roles"],
    [
        ["POST",   "/job/post", "recruiter, admin"],
        ["GET",    "/job/get", "any"],
        ["GET",    "/job/get/:id", "any"],
        ["GET",    "/job/getadminjobs", "recruiter, admin"],
    ],
    [60, 280, 195]
);

h2("5.4 Job applications");
table(
    ["Method", "Path", "Roles"],
    [
        ["GET",    "/application/apply/:id", "student"],
        ["GET",    "/application/get", "student (own)"],
        ["GET",    "/application/:id/applicants", "recruiter, admin"],
        ["POST",   "/application/status/:id/update", "recruiter, admin"],
    ],
    [60, 280, 195]
);

h2("5.5 Internships");
table(
    ["Method", "Path", "Roles"],
    [
        ["POST",   "/internship/post", "recruiter, admin"],
        ["GET",    "/internship/admin", "recruiter, admin"],
        ["GET",    "/internship/get", "any"],
        ["GET",    "/internship/get/:id", "any"],
        ["GET",    "/internship/applied", "student"],
        ["GET",    "/internship/apply/:id", "student"],
        ["GET",    "/internship/:id/applicants", "recruiter, admin"],
        ["POST",   "/internship/status/:id/update", "recruiter, admin"],
    ],
    [60, 280, 195]
);

h2("5.6 Admin (super-admin only)");
table(
    ["Method", "Path", "Description"],
    [
        ["GET",    "/admin/stats", "Platform-wide counts + 7-day deltas"],
        ["GET",    "/admin/users", "List/search users (?role=&q=)"],
        ["PATCH",  "/admin/users/:id/role", "Promote/demote a user"],
        ["DELETE", "/admin/users/:id", "Delete user (cannot delete self)"],
        ["GET",    "/admin/companies", "List/search companies (?verified=&q=)"],
        ["PATCH",  "/admin/companies/:id/verify", "Approve / revoke verification"],
        ["DELETE", "/admin/companies/:id", "Cascade-delete company + listings + apps"],
        ["GET",    "/admin/jobs", "List/search every job"],
        ["DELETE", "/admin/jobs/:id", "Delete job + its applications"],
        ["GET",    "/admin/internships", "List/search every internship"],
        ["DELETE", "/admin/internships/:id", "Delete internship + its applications"],
    ],
    [60, 220, 255]
);

// ============================================================
// 6. FRONTEND ARCHITECTURE
// ============================================================
h1("6. Frontend Architecture");

h2("6.1 Routing tree");
code([
    "/                         Landing page",
    "/login, /signup           Auth screens",
    "",
    "── DashboardLayout ──     (student-only views; redirects others)",
    "  /dashboard",
    "  /jobs                   Browse jobs",
    "  /internships            Browse internships",
    "  /internships/:id        Internship detail + Apply",
    "  /description/:id        Job detail + Apply",
    "  /companies              Public company directory",
    "  /interviews, /profile, /feedbacks, /reports",
    "",
    "── ProtectedRoute (recruiter|admin) ──",
    "  /admin/companies              (own companies)",
    "  /admin/companies/create",
    "  /admin/companies/:id          edit",
    "  /admin/jobs                   (own jobs)",
    "  /admin/jobs/create",
    "  /admin/jobs/:id/applicants",
    "  /admin/internships            (own internships)",
    "  /admin/internships/create",
    "  /admin/internships/:id/applicants",
    "",
    "── ProtectedRoute (admin only) ──",
    "  /admin/overview               KPIs & 7-day deltas",
    "  /admin/users                  manage users",
    "  /admin/all-companies          verify / delete",
    "  /admin/all-jobs",
    "  /admin/all-internships",
]);

h2("6.2 State management");
p("Redux Toolkit holds long-lived data; component state holds ephemeral UI state.");
table(
    ["Slice", "Holds"],
    [
        ["auth",        "Logged-in user, loading flag"],
        ["job",         "All jobs, single job, applied jobs, search query"],
        ["internship",  "All internships, admin internships, single internship, applied internships"],
        ["company",     "Companies owned by current recruiter, single company, search query"],
        ["application", "Applicants list for the active job/internship"],
    ],
    [120, 355]
);

h2("6.3 Data-fetch hooks");
p("Each hook is a thin wrapper around an axios call that dispatches into Redux. They are called inside pages so navigating to a route triggers its own fetch.");
bullets([
    "useGetAllJobs / useGetAllInternships — public lists.",
    "useGetAppliedJobs / useGetAppliedInternships — student's own applications.",
    "useGetAllCompanies — recruiter's owned companies.",
    "useGetAllAdminJobs / useGetAllAdminInternships — recruiter's own listings.",
    "useGetAllApplicants — applicants for one job/internship.",
]);

// ============================================================
// 7. KEY USER JOURNEYS
// ============================================================
h1("7. Key User Journeys");

h2("7.1 Student applies to a job");
bullets([
    "Student logs in → DashboardLayout renders.",
    "Navigates to /jobs → useGetAllJobs fetches /api/v1/job/get → list rendered.",
    "Clicks a card → /description/:id → JobDescription page loads single job.",
    "Press Apply Now → GET /api/v1/application/apply/:id → status becomes 'applied'.",
    "Profile → Applications shows the new entry. Recruiter sees it on /admin/jobs/:id/applicants.",
]);

h2("7.2 Recruiter posts an internship");
bullets([
    "Recruiter logs in → redirected to /admin/companies.",
    "Creates a Company (or selects one already owned).",
    "Goes to /admin/internships/create → fills the form → POST /api/v1/internship/post.",
    "Internship now appears in /admin/internships and in the public /internships list (if status=open).",
]);

h2("7.3 Admin verifies a company");
bullets([
    "Admin logs in → redirected to /admin/overview.",
    "Opens Companies tab → filters by 'Pending'.",
    "Clicks Approve → PATCH /api/v1/admin/companies/:id/verify { verified: true }.",
    "Company gets a green Verified badge that surfaces on Jobs/Internships listings.",
]);

h2("7.4 Admin moderates content");
bullets([
    "Spam job posted? Open /admin/all-jobs, search, click Delete → cascade removes applications.",
    "Bad actor recruiter? /admin/users → set role to 'student' or delete the account.",
    "Company offline? /admin/all-companies → Delete cascades through all related jobs, internships and their applications.",
]);

// ============================================================
// 8. INFRASTRUCTURE & DEPLOYMENT
// ============================================================
h1("8. Infrastructure & Configuration");

h2("8.1 Environment variables (backend/.env)");
code([
    "PORT=8000",
    "MONGO_URI=mongodb+srv://USER:PASS@host/jobportal",
    "",
    "SECRET_KEY=<64+ hex chars>",
    "JWT_EXPIRY=1d",
    "",
    "ADMIN_SIGNUP_CODE=<long random secret>",
    "",
    "CLOUDINARY_CLOUD_NAME=...",
    "CLOUDINARY_API_KEY=...",
    "CLOUDINARY_API_SECRET=...",
    "",
    "CLIENT_ORIGIN=http://localhost:5173",
]);

h2("8.2 External services");
table(
    ["Service", "Purpose", "Failure mode"],
    [
        ["MongoDB Atlas", "Persistent storage for all entities", "API returns 500; the server still serves /healthz so liveness probes work"],
        ["Cloudinary", "Hosting for company logos and student resumes", "Upload endpoints return an error; existing data unaffected"],
    ],
    [120, 200, 155]
);

h2("8.3 Local development");
code([
    "# One-shot bootstrap (Windows)",
    "setup.bat",
    "",
    "# Or manual:",
    "cd backend && npm install && npm run dev      # http://localhost:8000",
    "cd frontend && npm install && npm run dev     # http://localhost:5173",
]);

h2("8.4 Production checklist");
bullets([
    "Set strong SECRET_KEY and ADMIN_SIGNUP_CODE values; rotate the admin code after the first admin signs up.",
    "Restrict MongoDB Atlas network access to your hosting provider's IP range.",
    "Set CLIENT_ORIGIN to the deployed frontend URL so CORS allows credentialed requests.",
    "Build the frontend with `npm run build` and serve `frontend/dist` from any static host.",
    "Deploy the backend on a Node host (Render, Railway, Fly.io, EC2). Healthz endpoint: /healthz.",
    "Enable HTTPS so JWT cookies can be marked Secure.",
]);

// ============================================================
// 9. SECURITY NOTES
// ============================================================
h1("9. Security & Hardening");
bullets([
    "Passwords hashed with bcrypt (10 rounds) — plaintext never stored.",
    "JWTs are HTTP-only cookies, mitigating XSS-based token theft.",
    "RBAC enforced server-side via `authorize(...)`; the frontend uses `ProtectedRoute` purely for UX (never the source of truth).",
    "ADMIN_SIGNUP_CODE prevents privilege escalation via the public registration endpoint.",
    "Cascade deletes in admin actions prevent orphaned applications referencing deleted jobs/companies.",
    "InternshipApplication has a unique compound index on (internship, applicant) to prevent duplicate applications at the database layer.",
    "Self-protection: an admin cannot delete themselves or change their own role to a non-admin via the admin API.",
]);

callout("Future work",
    "Email verification, rate limiting on auth routes, CSP headers, audit log of admin actions, and unit tests for controllers are good next steps before exposing this publicly at scale.");

// ============================================================
// 10. APPENDIX
// ============================================================
h1("10. Appendix");

h2("10.1 Status state machines");
code([
    "Application.status / InternshipApplication.status",
    "    pending ─┬──> shortlisted ──> accepted",
    "             │                 └─> rejected",
    "             └──> rejected",
    "",
    "Internship.status",
    "    open <──> closed",
]);

h2("10.2 Quick scripts");
code([
    "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
    "  → generates SECRET_KEY",
    "",
    "node -e \"console.log(require('crypto').randomBytes(24).toString('hex'))\"",
    "  → generates ADMIN_SIGNUP_CODE",
    "",
    "node docs/generate-pdf.js",
    "  → regenerates this PDF after any architectural change",
]);

h2("10.3 File map (frequently-touched files)");
table(
    ["File", "Why it matters"],
    [
        ["backend/index.js", "Express bootstrap + route mounting"],
        ["backend/middlewares/isAuthenticated.js", "Verifies JWT and loads req.user"],
        ["backend/middlewares/authorize.js", "Role-based access control"],
        ["backend/controllers/admin.controller.js", "All super-admin moderation endpoints"],
        ["backend/models/*.model.js", "Mongoose schemas — single source of truth for data shape"],
        ["frontend/src/App.jsx", "Top-level route table"],
        ["frontend/src/components/admin/superadmin/*", "Admin console pages"],
        ["frontend/src/redux/*Slice.js", "Cross-page state"],
        ["frontend/src/utils/constant.js", "API base URLs"],
    ],
    [240, 235]
);

doc.end();
console.log(`PDF written: ${OUT}`);

// Dev always uses the Vite /api proxy (same origin). That lets a phone on the
// same Wi-Fi talk to the laptop without calling the phone's own localhost,
// and it keeps the auth cookie first-party. Production uses VITE_API_BASE_URL.
const configured = import.meta.env.VITE_API_BASE_URL;
const origin = import.meta.env.DEV
    ? ""
    : String(configured || "http://localhost:8000").replace(/\/$/, "");
const BASE = `${origin}/api/v1`;

export const USER_API_END_POINT = `${BASE}/user`;
export const JOB_API_END_POINT = `${BASE}/job`;
export const APPLICATION_API_END_POINT = `${BASE}/application`;
export const COMPANY_API_END_POINT = `${BASE}/company`;
export const INTERNSHIP_API_END_POINT = `${BASE}/internship`;
export const INTERVIEW_API_END_POINT = `${BASE}/interview`;
export const TESTIMONIAL_API_END_POINT = `${BASE}/testimonial`;
export const BOOKMARK_API_END_POINT = `${BASE}/bookmark`;
export const ADMIN_API_END_POINT = `${BASE}/admin`;

export const PREDEFINED_SKILLS = [
    "Construction Modeling",
    "English Communication Skills",
    "Civil Engineering",
    "KPI Analysis",
    "Mechanical Engineering",
    "Office (Excel, Word, PowerPoint)",
    "Procurement Quality Assurance",
    "Production Engineering",
    "Project Management",
    "Statistics",
    "Structural Design",
    "Team Collaboration",
    "Data Science",
    "Machine Learning",
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design"
];

export const DEGREE_OPTIONS = [
    "B.Tech", "B.E.", "M.Tech", "M.E.", "B.Sc", "M.Sc", "MBA", "PhD", "Diploma", "Other"
];

export const JAPANESE_LEVEL_OPTIONS = [
    "None", "Beginner", "JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1"
];

export const ENGLISH_LEVEL_OPTIONS = [
    "Basic", "Intermediate", "Fluent", "Native"
];

export const WORK_LOCATION_OPTIONS = [
    "Japan (Onsite)", "India (Remote)", "Hybrid", "Either"
];

export const RELOCATE_OPTIONS = ["Yes", "No"];

export const CERTIFICATE_CATEGORIES = [
    "Language", "Cloud", "Programming", "Academic", "Professional", "Other"
];

export const COMMON_CERTIFICATES = [
    { name: "JLPT N5", issuer: "Japan Foundation / JEES", category: "Language" },
    { name: "JLPT N4", issuer: "Japan Foundation / JEES", category: "Language" },
    { name: "JLPT N3", issuer: "Japan Foundation / JEES", category: "Language" },
    { name: "JLPT N2", issuer: "Japan Foundation / JEES", category: "Language" },
    { name: "JLPT N1", issuer: "Japan Foundation / JEES", category: "Language" },
    { name: "TOEIC", issuer: "ETS", category: "Language" },
    { name: "IELTS", issuer: "British Council / IDP", category: "Language" },
    { name: "TOEFL iBT", issuer: "ETS", category: "Language" },
    { name: "GATE", issuer: "IISc / IITs", category: "Academic" },
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", category: "Cloud" },
    { name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", category: "Cloud" },
    { name: "Google Cloud Associate Engineer", issuer: "Google Cloud", category: "Cloud" },
    { name: "Microsoft Azure Fundamentals (AZ-900)", issuer: "Microsoft", category: "Cloud" },
    { name: "Oracle Certified Java Programmer", issuer: "Oracle", category: "Programming" },
];

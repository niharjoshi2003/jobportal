const BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1`;

export const USER_API_END_POINT = `${BASE}/user`;
export const JOB_API_END_POINT = `${BASE}/job`;
export const APPLICATION_API_END_POINT = `${BASE}/application`;
export const COMPANY_API_END_POINT = `${BASE}/company`;
export const INTERNSHIP_API_END_POINT = `${BASE}/internship`;
export const INTERVIEW_API_END_POINT = `${BASE}/interview`;
export const TESTIMONIAL_API_END_POINT = `${BASE}/testimonial`;
export const BOOKMARK_API_END_POINT = `${BASE}/bookmark`;

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

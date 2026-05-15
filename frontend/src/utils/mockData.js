// Hardcoded test credentials & mock data for UI testing (no backend needed)

export const TEST_CREDENTIALS = {
    student: {
        email: "student@jobohire.com",
        password: "test1234",
        role: "student"
    },
    recruiter: {
        email: "recruiter@jobohire.com",
        password: "test1234",
        role: "recruiter"
    }
};

export const MOCK_USER = {
    _id: "mock_student_001",
    fullname: "Nihar Joshi",
    email: "student@jobohire.com",
    phoneNumber: 9000000000,
    role: "student",
    gender: "Male",
    college: "IIT Delhi",
    personalEmail: "nihar.personal@gmail.com",
    graduationYear: 2027,
    profile: {
        bio: "Aspiring software engineer passionate about full-stack development and AI/ML",
        skills: ["React", "Node.js", "Python", "JavaScript", "SQL"],
        customSkills: ["Problem Solving", "System Design"],
        resume: "",
        resumeOriginalName: "",
        resumes: [],
        profilePhoto: "",
        introVideo: { url: "", uploadedAt: null },
        externalLinks: [
            { type: "GitHub", url: "https://github.com/nihar", label: "GitHub" },
            { type: "LinkedIn", url: "https://linkedin.com/in/nihar", label: "LinkedIn" }
        ],
        profileCompletion: 60,
        company: null
    },
    bookmarkedJobs: ["mock_job_002", "mock_job_004"],
    notifications: [
        { message: "New internship at Sony Corporation matches your profile!", type: "internship", read: false, link: "/internships", createdAt: new Date().toISOString() },
        { message: "Your application for Data Science Intern has been viewed", type: "application", read: false, link: "/internships?tab=applied", createdAt: new Date(Date.now() - 86400000).toISOString() },
        { message: "Interview scheduled with Tech Japan Inc.", type: "interview", read: true, link: "/interviews", createdAt: new Date(Date.now() - 172800000).toISOString() }
    ]
};

export const MOCK_RECRUITER = {
    _id: "mock_recruiter_001",
    fullname: "Admin Recruiter",
    email: "recruiter@jobohire.com",
    phoneNumber: 9000000001,
    role: "recruiter",
    profile: {
        bio: "Hiring manager at Tech Japan",
        profilePhoto: "",
        profileCompletion: 80
    }
};

export const MOCK_COMPANIES = [
    { _id: "mock_comp_001", name: "PiPhotonics Inc.", description: "Japanese photonics and optical technology company specializing in laser systems and precision instruments.", website: "https://piphotonics.co.jp", location: "Tokyo, Japan", logo: "", industry: ["Engineering", "Manufacturing", "IT"], companyType: "Corporate", country: "Japan" },
    { _id: "mock_comp_002", name: "Artience Co., Ltd.", description: "Japanese materials science company driving innovation in functional materials and sustainability.", website: "https://artience.com", location: "Tokyo, Japan", logo: "", industry: ["Engineering", "Manufacturing"], companyType: "Corporate", country: "Japan" },
    { _id: "mock_comp_003", name: "Ishizaka Inc.", description: "Environmental solutions company in Japan focused on waste management and recycling technology.", website: "https://ishizaka.co.jp", location: "Saitama, Japan", logo: "", industry: ["Engineering", "Manufacturing"], companyType: "Corporate", country: "Japan" },
    { _id: "mock_comp_004", name: "Accenture Japan", description: "Global professional services company providing strategy, consulting, and technology services.", website: "https://accenture.com/jp", location: "Tokyo, Japan", logo: "", industry: ["IT", "Data Science", "Analytics"], companyType: "MNC", country: "Japan" },
    { _id: "mock_comp_005", name: "Bossard Japan", description: "Swiss fastening solutions company with Japanese operations, specializing in industrial engineering.", website: "https://bossard.com", location: "Tokyo, Japan", logo: "", industry: ["Engineering", "Manufacturing"], companyType: "MNC", country: "Japan" },
    { _id: "mock_comp_006", name: "GERD Japan", description: "Japanese R&D company focused on green energy and sustainable development technologies.", website: "https://gerd.co.jp", location: "Tokyo, Japan", logo: "", industry: ["Engineering", "Data Science", "IT"], companyType: "Corporate", country: "Japan" },
    { _id: "mock_comp_007", name: "Rakuten Group", description: "Japan's largest e-commerce and internet company offering diverse digital services.", website: "https://rakuten.co.jp", location: "Tokyo, Japan", logo: "", industry: ["IT", "Data Science", "Analytics"], companyType: "Corporate", country: "Japan" },
];

export const MOCK_JOBS = [
    {
        _id: "mock_job_001", title: "For 2027 Graduates only: Analog Circuit Design Engineer",
        description: "Design and optimize analog circuits for next-gen consumer electronics. Work with senior engineers in our Tokyo R&D lab on cutting-edge semiconductor projects.",
        requirements: ["Circuit Design", "VLSI", "SPICE Simulation"], salary: 50000, experienceLevel: 0,
        location: "Tokyo, Japan", jobType: "Internship", position: 3,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        duration: { value: 90, unit: "days" },
        eligibility: ["2027 Graduates", "Engineering Degrees"],
        tags: ["Hardware", "Electronics"],
        company: { _id: "mock_comp_002", name: "Artience Co., Ltd.", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        _id: "mock_job_002", title: "Software Engineering Intern - Full Stack",
        description: "Build scalable web applications using React and Node.js. Contribute to real products serving millions of users across Asia-Pacific region.",
        requirements: ["React", "Node.js", "JavaScript", "SQL"], salary: 45000, experienceLevel: 0,
        location: "Tokyo, Japan", jobType: "Internship", position: 5,
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        duration: { value: 60, unit: "days" },
        eligibility: ["Open to All Degrees", "2026-2027 Graduates"],
        tags: ["Software", "Web Development"],
        company: { _id: "mock_comp_001", name: "PiPhotonics Inc.", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
        _id: "mock_job_003", title: "Data Science Intern",
        description: "Analyze large-scale e-commerce data to derive actionable insights. Build ML models for recommendation systems and user behavior prediction.",
        requirements: ["Python", "Machine Learning", "SQL", "Statistics"], salary: 55000, experienceLevel: 0,
        location: "Remote", jobType: "Internship", position: 2,
        deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
        duration: { value: 30, unit: "days" },
        eligibility: ["2027 Graduates", "Data Science / CS Degrees"],
        tags: ["Data Science", "ML"],
        company: { _id: "mock_comp_004", name: "Accenture Japan", logo: "" },
        applications: [{ applicant: "mock_student_001" }], createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
        _id: "mock_job_004", title: "AI Research Intern",
        description: "Work on cutting-edge NLP and computer vision projects at our Bangalore R&D center. Publish research papers and attend international conferences.",
        requirements: ["Python", "PyTorch", "Deep Learning", "NLP"], salary: 30000, experienceLevel: 0,
        location: "Bangalore, India", jobType: "Internship", position: 4,
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
        duration: { value: 120, unit: "days" },
        eligibility: ["Open to All Degrees"],
        tags: ["AI", "Research"],
        company: { _id: "mock_comp_006", name: "GERD Japan", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
        _id: "mock_job_005", title: "Mechanical Engineering Intern",
        description: "Support production engineering team in optimizing manufacturing processes for hybrid vehicle components. Hands-on factory floor experience.",
        requirements: ["Mechanical Engineering", "CAD", "Production Engineering"], salary: 48000, experienceLevel: 0,
        location: "Aichi, Japan", jobType: "Internship", position: 2,
        deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
        duration: { value: 60, unit: "days" },
        eligibility: ["2027 Graduates", "Mechanical Engineering"],
        tags: ["Manufacturing", "Automotive"],
        company: { _id: "mock_comp_005", name: "Bossard Japan", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
        _id: "mock_job_006", title: "Cloud Infrastructure Engineer",
        description: "Design and deploy cloud infrastructure on AWS for high-traffic e-commerce platform. Work with Kubernetes, Terraform, and CI/CD pipelines.",
        requirements: ["AWS", "Docker", "Kubernetes", "Linux"], salary: 60000, experienceLevel: 1,
        location: "Tokyo, Japan", jobType: "Full Time", position: 1,
        deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
        eligibility: ["1+ year experience", "CS Degrees"],
        tags: ["Cloud", "DevOps"],
        company: { _id: "mock_comp_007", name: "Rakuten Group", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
        _id: "mock_job_007", title: "Frontend Developer Intern",
        description: "Build beautiful, responsive user interfaces for Ishizaka's environmental monitoring dashboards. Work with React, TypeScript, and design systems.",
        requirements: ["React", "TypeScript", "CSS", "Figma"], salary: 42000, experienceLevel: 0,
        location: "Saitama, Japan", jobType: "Internship", position: 3,
        deadline: new Date(Date.now() - 2 * 86400000).toISOString(),
        duration: { value: 45, unit: "days" },
        eligibility: ["2026-2027 Graduates", "Open to All Degrees"],
        tags: ["Frontend", "UI/UX"],
        company: { _id: "mock_comp_003", name: "Ishizaka Inc.", logo: "" },
        applications: [], createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
];

export const MOCK_APPLIED_JOBS = [
    { _id: "mock_app_001", job: MOCK_JOBS[2], status: "pending", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { _id: "mock_app_002", job: MOCK_JOBS[1], status: "accepted", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    { _id: "mock_app_003", job: MOCK_JOBS[6], status: "rejected", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
];

export const MOCK_INTERVIEWS = {
    upcoming: [
        {
            _id: "mock_int_001", position: "Software Engineering Intern - Full Stack",
            company: { _id: "mock_comp_001", name: "PiPhotonics Inc.", logo: "" },
            scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            duration: 30,
            interviewerEmails: ["tanaka@piphotonics.co.jp", "suzuki@piphotonics.co.jp"],
            status: "scheduled",
            meetingLink: "https://meet.google.com/abc-defg-hij",
            notes: "Please prepare a 5-minute presentation about a recent project you worked on.",
            field: "Software Engineering"
        },
        {
            _id: "mock_int_002", position: "Data Science Intern",
            company: { _id: "mock_comp_004", name: "Accenture Japan", logo: "" },
            scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            duration: 45,
            interviewerEmails: ["yamamoto@accenture.co.jp"],
            status: "scheduled",
            meetingLink: "https://zoom.us/j/123456789",
            notes: "Technical round: SQL queries, basic ML concepts, and a coding problem in Python.",
            field: "Data Science"
        }
    ],
    past: [
        {
            _id: "mock_int_003", position: "Frontend Developer Intern",
            company: { _id: "mock_comp_003", name: "Ishizaka Inc.", logo: "" },
            scheduledDate: new Date(Date.now() - 10 * 86400000).toISOString(),
            duration: 30,
            interviewerEmails: ["hr@nttdata.com"],
            status: "completed",
            field: "Frontend Development"
        }
    ]
};

export const MOCK_STATS = {
    totalApplications: 3,
    acceptedApplications: 1,
    pendingApplications: 1,
    rejectedApplications: 1,
    totalInterviews: 3,
    bookmarkedCount: 2,
    profileCompletion: 60,
    interviewSuccessRate: 33
};

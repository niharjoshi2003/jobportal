import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
    if (!MONGO_URI) {
        console.error("MONGO_URI not set. Copy backend/.env.example to backend/.env and fill it in.");
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash("test1234", 10);

        // ── Student user ──
        let student = await User.findOne({ email: "student@jobohire.com" });
        if (!student) {
            student = await User.create({
                fullname: "Nihar Joshi",
                email: "student@jobohire.com",
                phoneNumber: 9000000000,
                password: hashedPassword,
                role: "student",
                gender: "Male",
                college: "IIT Delhi",
                graduationYear: 2027,
                profile: {
                    bio: "Aspiring software engineer passionate about full-stack development",
                    skills: ["React", "Node.js", "Python", "JavaScript"],
                    customSkills: ["Problem Solving", "System Design"],
                    profilePhoto: "",
                    profileCompletion: 60,
                    externalLinks: [
                        { type: "GitHub", url: "https://github.com/nihar", label: "GitHub" },
                        { type: "LinkedIn", url: "https://linkedin.com/in/nihar", label: "LinkedIn" }
                    ]
                }
            });
            console.log("Student user created");
        } else {
            console.log("Student user already exists");
        }

        // ── Recruiter user ──
        let recruiter = await User.findOne({ email: "recruiter@jobohire.com" });
        if (!recruiter) {
            recruiter = await User.create({
                fullname: "Admin Recruiter",
                email: "recruiter@jobohire.com",
                phoneNumber: 9000000001,
                password: hashedPassword,
                role: "recruiter",
                profile: {
                    bio: "Hiring manager at Tech Japan",
                    profilePhoto: ""
                }
            });
            console.log("Recruiter user created");
        } else {
            console.log("Recruiter user already exists");
        }

        // ── Companies ──
        const companyData = [
            { name: "Tech Japan Inc.", description: "Leading tech company in Tokyo specializing in AI and cloud solutions.", website: "https://techjapan.co.jp", location: "Tokyo, Japan", industry: ["IT", "Data Science", "Engineering"], companyType: "Corporate", country: "Japan", userId: recruiter._id },
            { name: "Sony Corporation", description: "Global electronics and entertainment conglomerate.", website: "https://sony.com", location: "Tokyo, Japan", industry: ["Engineering", "Manufacturing", "IT"], companyType: "MNC", country: "Japan", userId: recruiter._id },
            { name: "Rakuten Group", description: "Japan's largest e-commerce and internet company.", website: "https://rakuten.co.jp", location: "Tokyo, Japan", industry: ["IT", "Data Science", "Analytics"], companyType: "Corporate", country: "Japan", userId: recruiter._id },
            { name: "InnoStart India", description: "Fast-growing AI startup connecting India and Japan markets.", website: "https://innostart.in", location: "Bangalore, India", industry: ["Data Science", "IT", "Analytics"], companyType: "Start-up", country: "India", userId: recruiter._id },
            { name: "Toyota Motors", description: "World's largest automobile manufacturer by volume.", website: "https://toyota.com", location: "Aichi, Japan", industry: ["Engineering", "Manufacturing"], companyType: "MNC", country: "Japan", userId: recruiter._id },
        ];

        const companies = [];
        for (const c of companyData) {
            let company = await Company.findOne({ name: c.name });
            if (!company) {
                company = await Company.create(c);
                console.log(`Company created: ${c.name}`);
            }
            companies.push(company);
        }

        // ── Jobs / Internships ──
        const jobData = [
            { title: "For 2027 Graduates: Analog Circuit Design Engineer", description: "Design and optimize analog circuits for next-gen consumer electronics. Work with senior engineers in our Tokyo R&D lab.", requirements: ["Circuit Design", "VLSI", "SPICE Simulation"], salary: 50000, experienceLevel: 0, location: "Tokyo, Japan", jobType: "Internship", position: 3, deadline: new Date("2026-06-30"), duration: { value: 90, unit: "days" }, eligibility: ["2027 Graduates", "Engineering Degrees"], tags: ["Hardware", "Electronics"], company: companies[1]._id, created_by: recruiter._id },
            { title: "Software Engineering Intern - Full Stack", description: "Build scalable web applications using React and Node.js. Contribute to real products serving millions of users.", requirements: ["React", "Node.js", "JavaScript", "SQL"], salary: 45000, experienceLevel: 0, location: "Tokyo, Japan", jobType: "Internship", position: 5, deadline: new Date("2026-07-15"), duration: { value: 60, unit: "days" }, eligibility: ["Open to All Degrees", "2026-2027 Graduates"], tags: ["Software", "Web Development"], company: companies[0]._id, created_by: recruiter._id },
            { title: "Data Science Intern", description: "Analyze large-scale e-commerce data to derive actionable insights. Build ML models for recommendation systems.", requirements: ["Python", "Machine Learning", "SQL", "Statistics"], salary: 55000, experienceLevel: 0, location: "Remote", jobType: "Internship", position: 2, deadline: new Date("2026-05-31"), duration: { value: 30, unit: "days" }, eligibility: ["2027 Graduates", "Data Science", "CS Degrees"], tags: ["Data Science", "ML"], company: companies[2]._id, created_by: recruiter._id },
            { title: "AI Research Intern", description: "Work on cutting-edge NLP and computer vision projects at our Bangalore R&D center.", requirements: ["Python", "PyTorch", "Deep Learning", "NLP"], salary: 30000, experienceLevel: 0, location: "Bangalore, India", jobType: "Internship", position: 4, deadline: new Date("2026-08-15"), duration: { value: 120, unit: "days" }, eligibility: ["Open to All Degrees"], tags: ["AI", "Research"], company: companies[3]._id, created_by: recruiter._id },
            { title: "Mechanical Engineering Intern", description: "Support production engineering team in optimizing manufacturing processes for hybrid vehicle components.", requirements: ["Mechanical Engineering", "CAD", "Production Engineering"], salary: 48000, experienceLevel: 0, location: "Aichi, Japan", jobType: "Internship", position: 2, deadline: new Date("2026-06-15"), duration: { value: 60, unit: "days" }, eligibility: ["2027 Graduates", "Mechanical Engineering"], tags: ["Manufacturing", "Automotive"], company: companies[4]._id, created_by: recruiter._id },
            { title: "Cloud Infrastructure Engineer", description: "Design and deploy cloud infrastructure on AWS for high-traffic e-commerce platform.", requirements: ["AWS", "Docker", "Kubernetes", "Linux"], salary: 60000, experienceLevel: 1, location: "Tokyo, Japan", jobType: "Full Time", position: 1, deadline: new Date("2026-09-01"), eligibility: ["1+ year experience", "CS Degrees"], tags: ["Cloud", "DevOps"], company: companies[2]._id, created_by: recruiter._id },
        ];

        for (const j of jobData) {
            const exists = await Job.findOne({ title: j.title, company: j.company });
            if (!exists) {
                await Job.create(j);
                console.log(`Job created: ${j.title}`);
            }
        }

        console.log("\n===== SEED COMPLETE =====");
        console.log("\nTest Credentials:");
        console.log("─────────────────────────────────");
        console.log("STUDENT LOGIN:");
        console.log("  Email:    student@jobohire.com");
        console.log("  Password: test1234");
        console.log("  Role:     student");
        console.log("─────────────────────────────────");
        console.log("RECRUITER LOGIN:");
        console.log("  Email:    recruiter@jobohire.com");
        console.log("  Password: test1234");
        console.log("  Role:     recruiter");
        console.log("─────────────────────────────────\n");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seed();

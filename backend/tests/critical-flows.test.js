import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.SECRET_KEY = process.env.SECRET_KEY || "test_secret_key_for_ci";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const { app } = await import("../app.js");
const { User } = await import("../models/user.model.js");
const { Company } = await import("../models/company.model.js");
const { Job } = await import("../models/job.model.js");

let mongoServer;

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
});

test("password recovery flow resets password and allows login", async () => {
    await request(app).post("/api/v1/user/register").send({
        fullname: "Student One",
        email: "student1@example.com",
        phoneNumber: "1234567890",
        password: "OldPass123",
        role: "student",
        college: "Test College",
        rollNumber: "R001",
    }).expect(201);

    // ensure student can log in (status approved is required by current flow)
    const student = await User.findOne({ email: "student1@example.com" });
    student.status = "approved";
    await student.save();

    const forgotRes = await request(app).post("/api/v1/user/forgot-password").send({
        email: "student1@example.com",
        role: "student",
    }).expect(200);

    assert.equal(forgotRes.body.success, true);
    assert.ok(forgotRes.body.resetToken, "Expected resetToken in test environment response");

    await request(app).post("/api/v1/user/reset-password").send({
        email: "student1@example.com",
        token: forgotRes.body.resetToken,
        newPassword: "NewPass123",
    }).expect(200);

    const loginRes = await request(app).post("/api/v1/user/login").send({
        email: "student1@example.com",
        password: "NewPass123",
        role: "student",
    }).expect(200);
    assert.equal(loginRes.body.success, true);
    assert.equal(loginRes.body.user.email, "student1@example.com");
});

test("job lifecycle controls and apply limits are enforced", async () => {
    const adminPassword = await bcrypt.hash("AdminPass123", 10);
    const studentPassword = await bcrypt.hash("StudPass123", 10);
    const student2Password = await bcrypt.hash("StudPass456", 10);

    const admin = await User.create({
        fullname: "Admin User",
        email: "admin@example.com",
        phoneNumber: 1234512345,
        password: adminPassword,
        role: "admin",
    });

    const student = await User.create({
        fullname: "Student A",
        email: "studa@example.com",
        phoneNumber: 9234512345,
        password: studentPassword,
        role: "student",
        status: "approved",
        college: "Test College",
        rollNumber: "A001",
    });

    await User.create({
        fullname: "Student B",
        email: "studb@example.com",
        phoneNumber: 8234512345,
        password: student2Password,
        role: "student",
        status: "approved",
        college: "Test College",
        rollNumber: "B001",
    });

    const company = await Company.create({
        name: "Lifecycle Corp",
        userId: admin._id,
        description: "Testing company",
    });

    const adminAgent = request.agent(app);
    const studentAgent = request.agent(app);
    const student2Agent = request.agent(app);

    await adminAgent.post("/api/v1/user/login").send({
        email: "admin@example.com",
        password: "AdminPass123",
        role: "admin",
    }).expect(200);

    await studentAgent.post("/api/v1/user/login").send({
        email: "studa@example.com",
        password: "StudPass123",
        role: "student",
    }).expect(200);

    await student2Agent.post("/api/v1/user/login").send({
        email: "studb@example.com",
        password: "StudPass456",
        role: "student",
    }).expect(200);

    const postJobRes = await adminAgent.post("/api/v1/job/post").send({
        title: "Lifecycle QA Engineer",
        description: "Role summary",
        requirements: "Node.js, Testing",
        salary: 10,
        location: "Remote",
        jobType: "Full Time",
        experience: 1,
        position: 1,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        companyOverview: "Company overview",
        jobRequirementsDetail: "Detailed requirements",
        additionalInfo: "Additional information",
        companyId: company._id.toString(),
        applicationQuestions: [
            { question: "Why do you want this role?", type: "short_text", required: true },
        ],
    }).expect(201);

    const jobId = postJobRes.body.job._id;
    assert.ok(jobId);

    await adminAgent.patch(`/api/v1/admin/jobs/${jobId}/lifecycle`).send({
        status: "closed",
    }).expect(200);

    const closedApply = await studentAgent.post(`/api/v1/application/apply/${jobId}`).send({
        answers: [{ questionId: postJobRes.body.job.applicationQuestions[0]._id, answer: "I am interested." }],
    }).expect(400);
    assert.match(closedApply.body.message, /not accepting applications/i);

    await adminAgent.patch(`/api/v1/admin/jobs/${jobId}/lifecycle`).send({
        status: "open",
    }).expect(200);

    await studentAgent.post(`/api/v1/application/apply/${jobId}`).send({
        answers: [{ questionId: postJobRes.body.job.applicationQuestions[0]._id, answer: "Great fit for me." }],
    }).expect(201);

    const secondApply = await student2Agent.post(`/api/v1/application/apply/${jobId}`).send({
        answers: [{ questionId: postJobRes.body.job.applicationQuestions[0]._id, answer: "Second candidate." }],
    }).expect(400);
    assert.match(secondApply.body.message, /maximum number of applications/i);

    const jobDoc = await Job.findById(jobId);
    assert.equal(jobDoc.status, "open");
    assert.equal(jobDoc.applications.length, 1);
    assert.equal(String(jobDoc.created_by), String(admin._id));
    assert.equal(String(student._id).length > 0, true);
});


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
const { Application } = await import("../models/application.model.js");

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
    assert.ok(loginRes.body.token, "Expected a bearer token for browsers that drop the auth cookie");

    const meRes = await request(app)
        .get("/api/v1/user/me")
        .set("Authorization", `Bearer ${loginRes.body.token}`)
        .expect(200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.user.email, "student1@example.com");

    const denied = await request(app).get("/api/v1/user/me").expect(401);
    assert.equal(denied.body.message, "User not authenticated");
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

test("external apply click creates pending record and avoids duplicates", async () => {
    const adminPassword = await bcrypt.hash("AdminPass456", 10);
    const studentPassword = await bcrypt.hash("StudPass789", 10);

    const admin = await User.create({
        fullname: "Admin External",
        email: "admin.external@example.com",
        phoneNumber: 7234512345,
        password: adminPassword,
        role: "admin",
    });

    const student = await User.create({
        fullname: "Student External",
        email: "student.external@example.com",
        phoneNumber: 6234512345,
        password: studentPassword,
        role: "student",
        status: "approved",
        college: "Test College",
        rollNumber: "EXT001",
    });

    const company = await Company.create({
        name: "External Apply Corp",
        userId: admin._id,
        description: "External apply testing company",
    });

    const adminAgent = request.agent(app);
    const studentAgent = request.agent(app);

    await adminAgent.post("/api/v1/user/login").send({
        email: "admin.external@example.com",
        password: "AdminPass456",
        role: "admin",
    }).expect(200);

    await studentAgent.post("/api/v1/user/login").send({
        email: "student.external@example.com",
        password: "StudPass789",
        role: "student",
    }).expect(200);

    const postJobRes = await adminAgent.post("/api/v1/job/post").send({
        title: "External Frontend Engineer",
        description: "External apply role",
        requirements: "React, TypeScript",
        salary: 12,
        location: "Remote",
        jobType: "Full Time",
        experience: 2,
        position: 20,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        companyOverview: "Company overview",
        jobRequirementsDetail: "Detailed requirements",
        additionalInfo: "Additional information",
        companyId: company._id.toString(),
        applicationMode: "external",
        externalApplyUrl: "https://example.com/careers/apply/external-frontend-engineer",
    }).expect(201);

    const jobId = postJobRes.body.job._id;
    assert.ok(jobId);
    assert.equal(postJobRes.body.job.applicationMode, "external");

    const firstClickRes = await studentAgent.post(`/api/v1/application/apply/${jobId}`).send({}).expect(201);
    assert.equal(firstClickRes.body.success, true);
    assert.match(firstClickRes.body.message, /click recorded/i);
    assert.equal(firstClickRes.body.redirectUrl, "https://example.com/careers/apply/external-frontend-engineer");

    const createdApplication = await Application.findOne({ job: jobId, applicant: student._id });
    assert.ok(createdApplication, "Expected external application record");
    assert.equal(createdApplication.status, "pending");
    assert.equal(createdApplication.applicationSource, "external");
    assert.ok(createdApplication.externalApplyClickAt, "Expected external click timestamp");

    const secondClickRes = await studentAgent.post(`/api/v1/application/apply/${jobId}`).send({}).expect(200);
    assert.equal(secondClickRes.body.success, true);
    assert.match(secondClickRes.body.message, /already recorded/i);

    const totalApplications = await Application.countDocuments({ job: jobId, applicant: student._id });
    assert.equal(totalApplications, 1);

    const jobDoc = await Job.findById(jobId);
    assert.equal(jobDoc.applications.length, 1);
});

// Regression guard: with `password: { select: false }` on the User schema,
// admin endpoints that load a target user via `findById` and then `.save()`
// used to throw "Path `password` is required." and return 500. The pre-validate
// hook in user.model.js must allow these partial updates through.
test("admin can approve and reject a pending student without 500", async () => {
    const adminPassword = await bcrypt.hash("AdminPass123", 10);
    await User.create({
        fullname: "Admin Approver",
        email: "approver@example.com",
        phoneNumber: 1112223333,
        password: adminPassword,
        role: "admin",
    });

    const pendingPassword = await bcrypt.hash("PendingPass123", 10);
    const pending = await User.create({
        fullname: "Pending Student",
        email: "pending@example.com",
        phoneNumber: 4445556666,
        password: pendingPassword,
        role: "student",
        status: "pending",
        college: "Test College",
        rollNumber: "P001",
    });

    const adminAgent = request.agent(app);
    await adminAgent.post("/api/v1/user/login").send({
        email: "approver@example.com",
        password: "AdminPass123",
        role: "admin",
    }).expect(200);

    const approveRes = await adminAgent
        .patch(`/api/v1/admin/users/${pending._id}/approve`)
        .send({})
        .expect(200);
    assert.equal(approveRes.body.success, true);
    assert.equal(approveRes.body.user.status, "approved");
    assert.equal(approveRes.body.user.password, undefined, "approve response must not leak the password hash");

    const afterApprove = await User.findById(pending._id).select("+password");
    assert.equal(afterApprove.status, "approved");
    assert.equal(afterApprove.password, pendingPassword, "approve must not wipe the existing password hash");

    const rejectRes = await adminAgent
        .patch(`/api/v1/admin/users/${pending._id}/reject`)
        .send({ reason: "Incomplete profile" })
        .expect(200);
    assert.equal(rejectRes.body.success, true);
    assert.equal(rejectRes.body.user.status, "rejected");
    assert.equal(rejectRes.body.user.rejectionReason, "Incomplete profile");

    const afterReject = await User.findById(pending._id).select("+password");
    assert.equal(afterReject.password, pendingPassword, "reject must not wipe the existing password hash");
});

test("admin can view a student profile and the job they applied to", async () => {
    const adminPassword = await bcrypt.hash("AdminPass789", 10);
    const admin = await User.create({
        fullname: "Transparency Admin",
        email: "transparency.admin@example.com",
        phoneNumber: 7778889999,
        password: adminPassword,
        role: "admin",
    });

    const studentPassword = await bcrypt.hash("StudentPass123", 10);
    const student = await User.create({
        fullname: "Applied Student",
        email: "applied.student@example.com",
        phoneNumber: 1212121212,
        password: studentPassword,
        role: "student",
        status: "approved",
        college: "Transparency College",
        rollNumber: "T100",
    });

    const company = await Company.create({
        name: "Transparency Co",
        userId: admin._id,
        verified: true,
    });
    const job = await Job.create({
        title: "Frontend Engineer",
        description: "Build UI",
        requirements: ["React"],
        salary: 10,
        location: "Remote",
        jobType: "Full-time",
        experienceLevel: 1,
        position: 5,
        company: company._id,
        created_by: admin._id,
    });
    await Application.create({
        job: job._id,
        applicant: student._id,
        status: "pending",
    });

    const adminAgent = request.agent(app);
    await adminAgent.post("/api/v1/user/login").send({
        email: "transparency.admin@example.com",
        password: "AdminPass789",
        role: "admin",
    }).expect(200);

    const profileRes = await adminAgent
        .get(`/api/v1/admin/users/${student._id}/profile`)
        .expect(200);
    assert.equal(profileRes.body.success, true);
    assert.equal(profileRes.body.applicant.email, "applied.student@example.com");
    assert.equal(profileRes.body.applicant.password, undefined);
    assert.equal(profileRes.body.jobApplications.length, 1);
    assert.equal(profileRes.body.jobApplications[0].job.title, "Frontend Engineer");
    assert.equal(profileRes.body.jobApplications[0].job.company.name, "Transparency Co");

    const listRes = await adminAgent.get("/api/v1/admin/applications?kind=job").expect(200);
    assert.equal(listRes.body.success, true);
    assert.ok(listRes.body.applications.some((row) => row.applicant?.email === "applied.student@example.com"));

    const jobsRes = await adminAgent.get("/api/v1/admin/jobs").expect(200);
    const listed = jobsRes.body.jobs.find((item) => String(item._id) === String(job._id));
    assert.equal(listed.applicantCount, 1);
});


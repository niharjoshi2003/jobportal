import test from "node:test";
import assert from "node:assert/strict";
import { resumeDownloadUrl, safeResumeFilename } from "../utils/resumeDelivery.js";

test("raw cloudinary resume URL downloads with the original pdf name", () => {
    const url = "https://res.cloudinary.com/demo/raw/upload/v1/job-o-hire/resumes/file_ehe7cx";
    const next = resumeDownloadUrl(url, "nihar resume.pdf");
    assert.equal(
        next,
        "https://res.cloudinary.com/demo/raw/upload/fl_attachment:nihar_resume.pdf/v1/job-o-hire/resumes/file_ehe7cx"
    );
});

test("resume URL rewrite does not stack the attachment flag", () => {
    const once = resumeDownloadUrl(
        "https://res.cloudinary.com/demo/raw/upload/v1/job-o-hire/resumes/file_ehe7cx",
        "nihar_resume.pdf"
    );
    assert.equal(resumeDownloadUrl(once, "nihar_resume.pdf"), once);
});

test("local upload paths are left unchanged", () => {
    const url = "https://jobportal-test-rz3s.onrender.com/uploads/resumes/nihar_resume.pdf";
    assert.equal(resumeDownloadUrl(url, "nihar_resume.pdf"), url);
});

test("missing extension defaults to pdf", () => {
    assert.equal(safeResumeFilename("Nihar Resume"), "Nihar_Resume.pdf");
});

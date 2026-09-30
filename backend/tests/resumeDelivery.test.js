import test from "node:test";
import assert from "node:assert/strict";
import { resumeDownloadUrl, safeResumeFilename } from "../utils/resumeDelivery.js";

test("pdf cloudinary URLs stay plain so the browser can open them", () => {
    const url = "https://res.cloudinary.com/demo/raw/upload/v1/job-o-hire/resumes/Nihar_Joshi_Resume_517ff88f.pdf";
    assert.equal(resumeDownloadUrl(url, "Nihar Joshi Resume.pdf"), url);
});

test("a dotted attachment flag is removed from an existing pdf URL", () => {
    const url = "https://res.cloudinary.com/demo/raw/upload/fl_attachment:Nihar_Joshi_Resume.pdf/v1/job-o-hire/resumes/Nihar_Joshi_Resume_517ff88f.pdf";
    assert.equal(
        resumeDownloadUrl(url, "Nihar Joshi Resume.pdf"),
        "https://res.cloudinary.com/demo/raw/upload/v1/job-o-hire/resumes/Nihar_Joshi_Resume_517ff88f.pdf"
    );
});

test("extensionless raw files get an attachment name without a dot", () => {
    const url = "https://res.cloudinary.com/demo/raw/upload/v1/job-o-hire/resumes/file_ehe7cx";
    assert.equal(
        resumeDownloadUrl(url, "nihar resume.pdf"),
        "https://res.cloudinary.com/demo/raw/upload/fl_attachment:nihar_resume/v1/job-o-hire/resumes/file_ehe7cx"
    );
});

test("local upload paths are left unchanged", () => {
    const url = "https://jobportal-test-rz3s.onrender.com/uploads/resumes/nihar_resume.pdf";
    assert.equal(resumeDownloadUrl(url, "nihar_resume.pdf"), url);
});

test("missing extension defaults to pdf", () => {
    assert.equal(safeResumeFilename("Nihar Resume"), "Nihar_Resume.pdf");
});

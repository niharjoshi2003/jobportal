import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedResume, exposeSelectedResumes } from '../utils/resumeSelection.js';
const resumes = [{ _id: 'a', url: '/a', originalName: 'a.pdf' }, { _id: 'b', url: '/b', originalName: 'b.pdf' }];
test('recruiter responses expose only the selected resume in nested applications', () => {
    const body = { applications: [{ applicant: { profile: { resumes, selectedResumeId: 'b', resume: '/a' } } }] };
    exposeSelectedResumes(body);
    const profile = body.applications[0].applicant.profile;
    assert.deepEqual(profile.resumes, [resumes[1]]);
    assert.equal(profile.resume, '/b');
    assert.equal(profile.resumeOriginalName, 'b.pdf');
});
test('cleared or missing selection never exposes another file', () => {
    assert.equal(selectedResume({ resumes, selectedResumeId: null, resume: '/a' }), null);
    assert.equal(selectedResume({ resumes, selectedResumeId: 'missing', resume: '/a' }), null);
});
test('legacy profiles expose only their existing main resume', () => {
    assert.equal(selectedResume({ resumes, resume: '/a' }).url, '/a');
    assert.equal(selectedResume({ resumes }), null);
});

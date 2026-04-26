import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const initialForm = {
    name: '',
    website: '',
    location: '',
    industry: '',
    companyType: '',
    country: 'Japan',
    description: '',
    culture: '',
    recruiterFullname: '',
    recruiterEmail: '',
    recruiterPhone: '',
};

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState(null); // { email, password, companyId }

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.recruiterFullname || !form.recruiterEmail || !form.recruiterPhone) {
            toast.error('Company name, recruiter name, email and phone are required.');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${ADMIN_API_END_POINT}/companies`, form, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.data?.success) {
                setCredentials({
                    email: res.data.credentials.email,
                    password: res.data.credentials.password,
                    companyId: res.data.company?._id,
                });
                toast.success('Company created.');
            } else {
                toast.error(res.data?.message || 'Failed to create company.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create company.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!credentials) return;
        const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Credentials copied to clipboard.');
        } catch {
            toast.error('Could not copy. Please select and copy manually.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4">
                <div className="my-8">
                    <h1 className="font-bold text-2xl text-foreground">Register a New Company</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Fill in the company details and the recruiter contact. The system will create a recruiter
                        login account automatically and show you the password <strong>once</strong>.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Company Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Company Name *</Label>
                                <Input name="name" value={form.name} onChange={onChange} placeholder="Acme Corp" />
                            </div>
                            <div>
                                <Label>Website</Label>
                                <Input name="website" value={form.website} onChange={onChange} placeholder="https://acme.co" />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input name="location" value={form.location} onChange={onChange} placeholder="Tokyo, Japan" />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input name="country" value={form.country} onChange={onChange} />
                            </div>
                            <div>
                                <Label>Industry (comma separated)</Label>
                                <Input name="industry" value={form.industry} onChange={onChange} placeholder="IT, Manufacturing" />
                            </div>
                            <div>
                                <Label>Company Type</Label>
                                <select
                                    name="companyType"
                                    value={form.companyType}
                                    onChange={onChange}
                                    className="mt-1 w-full h-10 rounded-md border border-border bg-white/5 px-3 text-sm text-foreground"
                                >
                                    <option value="">Select...</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Start-up">Start-up</option>
                                    <option value="MNC">MNC</option>
                                    <option value="Government">Government</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                placeholder="Short description of the company"
                            />
                        </div>
                        <div>
                            <Label>Culture</Label>
                            <textarea
                                name="culture"
                                value={form.culture}
                                onChange={onChange}
                                rows={2}
                                className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                placeholder="Work culture, values, perks..."
                            />
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Recruiter Account</h2>
                        <p className="text-xs text-muted-foreground">
                            A recruiter user will be created with the email below. They will use it to log in and
                            review applicants for this company. The password is auto-generated and shown only once.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Recruiter Full Name *</Label>
                                <Input name="recruiterFullname" value={form.recruiterFullname} onChange={onChange} placeholder="Jane Smith" />
                            </div>
                            <div>
                                <Label>Recruiter Email *</Label>
                                <Input type="email" name="recruiterEmail" value={form.recruiterEmail} onChange={onChange} placeholder="jane@acme.co" />
                            </div>
                            <div>
                                <Label>Recruiter Phone *</Label>
                                <Input name="recruiterPhone" value={form.recruiterPhone} onChange={onChange} placeholder="9876543210" />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/all-companies')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Company & Recruiter'}
                        </Button>
                    </div>
                </form>
            </div>

            {credentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-background border border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-foreground">Recruiter Credentials</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Copy these credentials and share them with the recruiter through a secure channel.
                            <strong> The password will not be shown again.</strong>
                        </p>
                        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-border space-y-2 font-mono text-sm">
                            <div><span className="text-muted-foreground">Email: </span><span className="text-foreground">{credentials.email}</span></div>
                            <div><span className="text-muted-foreground">Password: </span><span className="text-primary">{credentials.password}</span></div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <Button onClick={copyToClipboard} className="flex-1">Copy</Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setCredentials(null);
                                    setForm(initialForm);
                                    navigate('/admin/all-companies');
                                }}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyCreate;

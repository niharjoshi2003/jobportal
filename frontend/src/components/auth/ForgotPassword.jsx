import { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { USER_API_END_POINT } from "@/utils/constant";

const ForgotPassword = () => {
    const [searchParams] = useSearchParams();
    const roleFromQuery = searchParams.get("role");
    const [input, setInput] = useState({
        email: "",
        role: ["student", "recruiter", "admin"].includes(roleFromQuery) ? roleFromQuery : "student",
    });
    const [loading, setLoading] = useState(false);
    const [fallback, setFallback] = useState(null);

    const copyToClipboard = async (value, label) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Failed to copy ${label.toLowerCase()}`);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.email) {
            toast.error("Please enter your registered email.");
            return;
        }
        try {
            setLoading(true);
            setFallback(null);
            const res = await axios.post(
                `${USER_API_END_POINT}/forgot-password`,
                input,
                { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );
            toast.success(res.data?.message || "If your account exists, reset link has been sent.");
            if (res.data?.fallback?.resetLink) {
                setFallback(res.data.fallback);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md glass-card rounded-2xl p-6">
                <h1 className="text-xl font-bold text-foreground">Forgot Password</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your registered email. We will send a reset link.
                </p>

                <form onSubmit={submitHandler} className="space-y-4 mt-5">
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={input.email}
                            onChange={(e) => setInput((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="you@example.com"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Account Type</Label>
                        <select
                            value={input.role}
                            onChange={(e) => setInput((prev) => ({ ...prev, role: e.target.value }))}
                            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="student">Student</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <Button className="w-full" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>

                {fallback?.resetLink && (
                    <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 space-y-2">
                        <p className="text-xs text-yellow-200">
                            SMTP is unavailable. Use this temporary reset link:
                        </p>
                        <a
                            href={fallback.resetLink}
                            className="block text-xs text-primary break-all hover:underline"
                        >
                            {fallback.resetLink}
                        </a>
                        <p className="text-[11px] text-muted-foreground">
                            Expires at: {new Date(fallback.expiresAt).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="text-xs h-8"
                                onClick={() => copyToClipboard(fallback.resetLink, "Reset link")}
                            >
                                Copy Link
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="text-xs h-8"
                                onClick={() => copyToClipboard(fallback.resetToken, "Reset token")}
                            >
                                Copy Token
                            </Button>
                        </div>
                    </div>
                )}

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Remembered your password?{" "}
                    <Link to={input.role === "student" ? "/login" : "/portal-login"} className="text-primary hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;


import { useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { USER_API_END_POINT } from "@/utils/constant";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get("token") || "";
    const emailFromUrl = searchParams.get("email") || "";

    const [input, setInput] = useState({
        token: tokenFromUrl,
        email: emailFromUrl,
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return input.token && input.newPassword && input.confirmPassword;
    }, [input]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!canSubmit) {
            toast.error("Please fill all required fields.");
            return;
        }
        if (input.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (input.newPassword !== input.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${USER_API_END_POINT}/reset-password`,
                {
                    token: input.token,
                    email: input.email || undefined,
                    newPassword: input.newPassword,
                },
                { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );
            toast.success(res.data?.message || "Password reset successful.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md glass-card rounded-2xl p-6">
                <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your reset token and choose a new password.
                </p>

                <form onSubmit={submitHandler} className="space-y-4 mt-5">
                    <div>
                        <Label>Reset Token</Label>
                        <Input
                            name="token"
                            value={input.token}
                            onChange={(e) => setInput((prev) => ({ ...prev, token: e.target.value }))}
                            placeholder="Paste token from email"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Email (optional)</Label>
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
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            name="newPassword"
                            value={input.newPassword}
                            onChange={(e) => setInput((prev) => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={input.confirmPassword}
                            onChange={(e) => setInput((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            className="mt-1"
                        />
                    </div>

                    <Button className="w-full" disabled={loading || !canSubmit}>
                        {loading ? "Updating..." : "Reset Password"}
                    </Button>
                </form>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Back to{" "}
                    <Link to="/login" className="text-primary hover:underline">
                        login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;


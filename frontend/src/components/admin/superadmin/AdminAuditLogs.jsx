import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import AdminShell from "./AdminShell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            params.set("limit", "50");
            const res = await axios.get(`${ADMIN_API_END_POINT}/audit-logs?${params}`, { withCredentials: true });
            if (res.data?.success) setLogs(res.data.logs || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AdminShell title="Audit Logs" subtitle="Trace sensitive admin actions and lifecycle changes">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-80">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search action/entity/email/job..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <span className="text-sm text-muted-foreground">{logs.length} logs</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Metadata</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found.</TableCell></TableRow>
                        ) : logs.map((log) => (
                            <TableRow key={log._id}>
                                <TableCell className="font-medium">{log.action}</TableCell>
                                <TableCell className="text-muted-foreground">{log.entityType} {log.entityId ? `(${log.entityId.slice(-6)})` : ""}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {log.actor?.fullname || "Unknown"} ({log.actor?.email || log.actorRole})
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[380px] truncate">
                                    {JSON.stringify(log.metadata || {})}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminShell>
    );
};

export default AdminAuditLogs;


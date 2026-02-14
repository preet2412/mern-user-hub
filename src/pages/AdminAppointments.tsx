import { useState } from "react";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminAppointments = () => {
  const { appointments, cancelAppointment, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [statusFilter, setStatusFilter] = useState(initialFilter);

  const filtered = appointments
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const statusColor = (s: string) => {
    switch (s) {
      case "Booked": return "bg-primary/10 text-primary";
      case "Accepted": return "bg-secondary/10 text-secondary";
      case "In Progress": return "bg-warning/10 text-warning";
      case "Completed": return "bg-secondary/10 text-secondary";
      case "Cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filters = ["all", "Booked", "Accepted", "In Progress", "Completed", "Cancelled"];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Appointments</h1>
      <p className="text-muted-foreground">{filtered.length} appointment(s)</p>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => {
                  const rx = getPrescriptionByAppointment(apt.id);
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.patientName}</TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell className="text-muted-foreground">{apt.specialization}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{apt.location || "—"}</TableCell>
                      <TableCell>{apt.date}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                        {apt.status === "Cancelled" && apt.cancelReason && (
                          <p className="text-[10px] text-destructive mt-0.5">{apt.cancelReason}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                          {rx ? "Given" : "Not Given"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(apt.status === "Booked" || apt.status === "Accepted") && (
                            <Button size="sm" variant="outline" className="text-destructive text-xs h-7" onClick={() => {
                              cancelAppointment(apt.id, "Cancelled by admin");
                              toast({ title: "Appointment cancelled" });
                            }}>
                              Cancel
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(`/prescription/${apt.id}`)}>
                            View Rx
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No appointments found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointments;

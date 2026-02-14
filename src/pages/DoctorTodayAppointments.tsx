import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Video, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DoctorTodayAppointments = () => {
  const { user } = useAuth();
  const { appointments, acceptAppointment, rejectAppointment, updateAppointmentStatus, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();

  const today = "2026-02-14";
  const todayAppointments = appointments
    .filter((a) => a.doctorId === user?.id && a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }
    rejectAppointment(id, rejectReason);
    toast({ title: "Appointment rejected. Patient will be refunded." });
    setRejectId(null);
    setRejectReason("");
  };

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Today's Appointments</h1>
      <p className="text-muted-foreground">Date: {today} • {todayAppointments.length} appointment(s)</p>

      {todayAppointments.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-8 text-center text-muted-foreground">No appointments for today.</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {todayAppointments.map((apt) => {
          const rx = getPrescriptionByAppointment(apt.id);
          return (
            <Card key={apt.id} className="border-0 shadow-md">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {apt.patientName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">Age: {apt.patientAge || "—"} • {apt.patientMedicalHistory || "No history"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />{apt.time}
                        <span>• {apt.specialization}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                </div>

                {apt.status === "Booked" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => acceptAppointment(apt.id)} className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Accept
                    </Button>
                    {rejectId === apt.id ? (
                      <div className="flex gap-2 items-end flex-1">
                        <Input placeholder="Reason (patient will be refunded)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="text-sm" />
                        <Button size="sm" variant="destructive" onClick={() => handleReject(apt.id)}>Send</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>×</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectId(apt.id)}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    )}
                  </div>
                )}

                {apt.status === "Accepted" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateAppointmentStatus(apt.id, "In Progress"); navigate(`/video/${apt.id}`); }} className="gap-1">
                      <Video className="h-3 w-3" /> Start Consultation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(apt.id, "Completed")}>Mark Completed</Button>
                  </div>
                )}

                {apt.status === "In Progress" && (
                  <Button size="sm" onClick={() => navigate(`/video/${apt.id}`)} className="gap-1">
                    <Video className="h-3 w-3" /> Rejoin Video
                  </Button>
                )}

                {rx && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>View Prescription</Button>
                )}

                {apt.status === "Cancelled" && apt.cancelReason && (
                  <p className="text-xs text-destructive">Reason: {apt.cancelReason}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorTodayAppointments;

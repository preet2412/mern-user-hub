import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Stethoscope, IndianRupee, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientAppointments = () => {
  const { user } = useAuth();
  const { appointments, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const myAppointments = appointments
    .filter((a) => a.patientId === user?.id)
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

  const today = "2026-02-14";

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
      <p className="text-muted-foreground">All your appointments in detail.</p>

      {myAppointments.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-8 text-center text-muted-foreground">No appointments found.</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {myAppointments.map((apt) => {
          const rx = getPrescriptionByAppointment(apt.id);
          const canJoin = apt.status === "Accepted" && apt.date === today;
          return (
            <Card key={apt.id} className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{apt.doctorName}</CardTitle>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5" /> {apt.specialization}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {apt.location || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {apt.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {apt.time}
                  </div>
                  {apt.consultationFee && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IndianRupee className="h-3.5 w-3.5" /> ₹{apt.consultationFee}
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  <span className={rx ? "text-secondary font-semibold" : "text-muted-foreground"}>
                    Prescription: {rx ? "Given" : "Not Given"}
                  </span>
                </div>
                {apt.status === "Cancelled" && apt.cancelReason && (
                  <p className="text-xs text-destructive">Reason: {apt.cancelReason}</p>
                )}
                <div className="flex gap-2 pt-1">
                  {canJoin && (
                    <Button size="sm" onClick={() => navigate(`/video/${apt.id}`)} className="gap-1">
                      <Video className="h-3 w-3" /> Join Consultation
                    </Button>
                  )}
                  {rx && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>
                      View Prescription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PatientAppointments;

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Stethoscope, IndianRupee, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientMedicalHistory = () => {
  const { user } = useAuth();
  const { appointments, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pastAppointments = appointments
    .filter((a) => a.patientId === user?.id && (a.status === "Completed" || a.status === "Cancelled"))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
      <p className="text-muted-foreground">Your past appointments and prescription records.</p>

      {user?.medicalHistory && (
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-base">General Medical History</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{user.medicalHistory}</p></CardContent>
        </Card>
      )}

      {pastAppointments.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-8 text-center text-muted-foreground">No past appointments found.</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {pastAppointments.map((apt) => {
          const rx = getPrescriptionByAppointment(apt.id);
          const isExpanded = expandedId === apt.id;
          return (
            <Card key={apt.id} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialization} • {apt.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                      apt.status === "Completed" ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                    }`}>
                      {apt.status}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {apt.location || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {apt.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" /> {apt.date}
                      </div>
                      {apt.consultationFee && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <IndianRupee className="h-3.5 w-3.5" /> ₹{apt.consultationFee}
                        </div>
                      )}
                    </div>
                    {apt.status === "Cancelled" && apt.cancelReason && (
                      <p className="text-xs text-destructive">Reason: {apt.cancelReason}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                        Prescription: {rx ? "Given" : "Not Given"}
                      </span>
                      {rx && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>
                          View Prescription
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;

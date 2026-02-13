import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, FileText, Activity, IndianRupee, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const { user, users } = useAuth();
  const { appointments, bookAppointment, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const doctors = users.filter((u) => u.role === "doctor");
  const myAppointments = appointments.filter((a) => a.patientId === user?.id);

  const [bookingDoctor, setBookingDoctor] = useState<string | null>(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");

  const handleBook = () => {
    const doc = doctors.find((d) => d.id === bookingDoctor);
    if (!doc || !user || !bookDate || !bookTime) return;
    bookAppointment({
      patientId: user.id,
      patientName: `${user.firstName} ${user.lastName}`,
      patientAge: user.age,
      patientMedicalHistory: user.medicalHistory,
      doctorId: doc.id,
      doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
      specialization: doc.specialization || "",
      date: bookDate,
      time: bookTime,
    });
    setBookingDoctor(null);
    setBookDate("");
    setBookTime("");
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Booked": return "text-primary";
      case "In Progress": return "text-warning";
      case "Completed": return "text-secondary";
      case "Cancelled": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {user?.firstName}. Manage your health journey here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{myAppointments.filter((a) => a.status === "Booked").length}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Age</CardTitle>
            <Activity className="h-5 w-5 text-accent-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{user?.age || "—"}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical History</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-sm font-medium">{user?.medicalHistory || "None recorded"}</div></CardContent>
        </Card>
      </div>

      {/* Available Doctors */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Available Doctors</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <Card key={doc.id} className="border-0 shadow-md">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                    {doc.firstName[0]}{doc.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">Dr. {doc.firstName} {doc.lastName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      {doc.specialization}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <IndianRupee className="h-4 w-4" />
                  <span className="font-semibold text-foreground">₹{doc.consultationFee}</span>
                </div>

                {bookingDoctor === doc.id ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
                    <Input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleBook} disabled={!bookDate || !bookTime}>Submit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setBookingDoctor(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => setBookingDoctor(doc.id)}>Book</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
          {myAppointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium">{apt.doctorName}</p>
                <p className="text-xs text-muted-foreground">{apt.specialization}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <CalendarDays className="h-3 w-3" />{apt.date}
                  <Clock className="h-3 w-3 ml-1" />{apt.time}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                {apt.status === "Completed" && getPrescriptionByAppointment(apt.id) && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>
                    View Prescription
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;

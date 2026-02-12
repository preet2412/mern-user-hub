import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, FileText, Activity } from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();

  const mockAppointments = [
    { id: 1, doctor: "Dr. Rajesh Sharma", specialization: "Cardiology", date: "2026-02-13", time: "10:00 AM", status: "Booked" },
    { id: 2, doctor: "Dr. Priya Patel", specialization: "Dermatology", date: "2026-02-15", time: "3:00 PM", status: "Booked" },
  ];

  const mockPrescriptions = [
    { id: 1, doctor: "Dr. Sharma", date: "2026-02-01", medicine: "Amlodipine 5mg" },
    { id: 2, doctor: "Dr. Patel", date: "2026-01-20", medicine: "Cetirizine 10mg" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {user?.firstName}. Manage your health journey here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">2</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prescriptions</CardTitle>
            <FileText className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">2</div></CardContent>
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

      {/* Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAppointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium">{apt.doctor}</p>
                <p className="text-xs text-muted-foreground">{apt.specialization}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <CalendarDays className="h-3 w-3" />{apt.date}
                  <Clock className="h-3 w-3 ml-1" />{apt.time}
                </div>
              </div>
              <Badge variant="secondary">{apt.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPrescriptions.map((rx) => (
            <div key={rx.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium">{rx.medicine}</p>
                <p className="text-xs text-muted-foreground">by {rx.doctor} • {rx.date}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;

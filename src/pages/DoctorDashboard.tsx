import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, IndianRupee, Stethoscope } from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();

  const mockAppointments = [
    { id: 1, patient: "John Doe", date: "2026-02-13", time: "10:00 AM", status: "Booked" },
    { id: 2, patient: "Jane Smith", date: "2026-02-13", time: "11:30 AM", status: "Booked" },
    { id: 3, patient: "Amit Kumar", date: "2026-02-14", time: "2:00 PM", status: "Booked" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, Dr. {user?.lastName}. Here's your schedule overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">2</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">18</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Specialization</CardTitle>
            <Stethoscope className="h-5 w-5 text-accent-foreground" />
          </CardHeader>
          <CardContent><div className="text-lg font-bold">{user?.specialization || "—"}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consultation Fee</CardTitle>
            <IndianRupee className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">₹{user?.consultationFee || 0}</div></CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAppointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {apt.patient.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{apt.patient}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {apt.date}
                    <Clock className="h-3 w-3 ml-1" />
                    {apt.time}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{apt.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;

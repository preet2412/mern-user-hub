import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, UserCheck, CalendarDays, CheckCircle, XCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { users, user } = useAuth();
  const { appointments, prescriptions } = useClinic();
  const navigate = useNavigate();

  const userStats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary", link: "/admin/users" },
    { label: "Doctors", value: users.filter((u) => u.role === "doctor").length, icon: Stethoscope, color: "text-secondary", link: "/admin/users?tab=doctor" },
    { label: "Patients", value: users.filter((u) => u.role === "patient").length, icon: UserCheck, color: "text-accent-foreground", link: "/admin/users?tab=patient" },
  ];

  const appointmentStats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarDays, color: "text-primary", link: "/admin/appointments" },
    { label: "Completed", value: appointments.filter((a) => a.status === "Completed").length, icon: CheckCircle, color: "text-secondary", link: "/admin/appointments?filter=Completed" },
    { label: "Cancelled", value: appointments.filter((a) => a.status === "Cancelled").length, icon: XCircle, color: "text-destructive", link: "/admin/appointments?filter=Cancelled" },
    { label: "Prescriptions Issued", value: prescriptions.length, icon: FileText, color: "text-accent-foreground", link: "/admin/appointments" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName}. Here's an overview of MediConnect.</p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {userStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(stat.link)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view →</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {appointmentStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(stat.link)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view →</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>Manage Users</Button>
        <Button variant="outline" onClick={() => navigate("/admin/appointments")}>View All Appointments</Button>
      </div>
    </div>
  );
};

export default AdminDashboard;

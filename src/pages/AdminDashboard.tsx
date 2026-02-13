import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, UserCheck, ShieldCheck, CalendarDays, CheckCircle, XCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { users, user } = useAuth();
  const { appointments, prescriptions, cancelAppointment, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const userStats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Doctors", value: users.filter((u) => u.role === "doctor").length, icon: Stethoscope, color: "text-secondary" },
    { label: "Patients", value: users.filter((u) => u.role === "patient").length, icon: UserCheck, color: "text-accent-foreground" },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: ShieldCheck, color: "text-destructive" },
  ];

  const appointmentStats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarDays, color: "text-primary" },
    { label: "Completed", value: appointments.filter((a) => a.status === "Completed").length, icon: CheckCircle, color: "text-secondary" },
    { label: "Cancelled", value: appointments.filter((a) => a.status === "Cancelled").length, icon: XCircle, color: "text-destructive" },
    { label: "Prescriptions Issued", value: prescriptions.length, icon: FileText, color: "text-accent-foreground" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.firstName}. Here's an overview of MediConnect.
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {appointmentStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Patient</th>
                  <th className="pb-3 font-medium text-muted-foreground">Doctor</th>
                  <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Time</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Prescription</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const rx = getPrescriptionByAppointment(apt.id);
                  const statusColor =
                    apt.status === "Booked" ? "text-primary" :
                    apt.status === "Completed" ? "text-secondary" :
                    apt.status === "Cancelled" ? "text-destructive" :
                    "text-warning";
                  return (
                    <tr key={apt.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{apt.patientName}</td>
                      <td className="py-3">{apt.doctorName}</td>
                      <td className="py-3 hidden sm:table-cell">{apt.location || "—"}</td>
                      <td className="py-3">{apt.date}</td>
                      <td className="py-3 hidden sm:table-cell">{apt.time}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold ${statusColor}`}>{apt.status}</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                          {rx ? "Given" : "Not Given"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {apt.status === "Booked" && (
                            <Button size="sm" variant="outline" className="text-destructive text-xs h-7" onClick={() => cancelAppointment(apt.id)}>
                              Cancel
                            </Button>
                          )}
                          {rx && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(`/prescription/${apt.id}`)}>
                              View Rx
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {appointments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No appointments found.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.slice(-5).reverse().map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                    u.role === "admin" ? "bg-destructive" : u.role === "doctor" ? "bg-secondary" : "bg-primary"
                  }`}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase text-accent-foreground">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

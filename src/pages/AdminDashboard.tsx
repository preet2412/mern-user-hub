import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, UserCheck, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const { users, user } = useAuth();

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Doctors", value: users.filter((u) => u.role === "doctor").length, icon: Stethoscope, color: "text-secondary" },
    { label: "Patients", value: users.filter((u) => u.role === "patient").length, icon: UserCheck, color: "text-accent-foreground" },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: ShieldCheck, color: "text-destructive" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.firstName}. Here's an overview of Virtual Clinic.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

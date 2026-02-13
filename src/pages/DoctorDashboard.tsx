import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, Users, IndianRupee, Stethoscope, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus, addPrescription, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const myAppointments = appointments.filter((a) => a.doctorId === user?.id);
  const todayCount = myAppointments.filter((a) => a.date === "2026-02-13" && a.status === "Booked").length;

  // Prescription form state
  const [rxAppointmentId, setRxAppointmentId] = useState<string | null>(null);
  const [rxForm, setRxForm] = useState({ medicineName: "", dosage: "", duration: "", instructions: "" });

  const handleMarkCompleted = (aptId: string) => {
    updateAppointmentStatus(aptId, "Completed");
    setRxAppointmentId(aptId);
  };

  const handleStartConsultation = (aptId: string) => {
    updateAppointmentStatus(aptId, "In Progress");
    navigate(`/video/${aptId}`);
  };

  const handleSavePrescription = () => {
    const apt = myAppointments.find((a) => a.id === rxAppointmentId);
    if (!apt || !user) return;
    addPrescription({
      appointmentId: apt.id,
      doctorId: user.id,
      doctorName: `Dr. ${user.firstName} ${user.lastName}`,
      patientId: apt.patientId,
      patientName: apt.patientName,
      date: new Date().toISOString().split("T")[0],
      ...rxForm,
    });
    setRxAppointmentId(null);
    setRxForm({ medicineName: "", dosage: "", duration: "", instructions: "" });
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
          <CardContent><div className="text-3xl font-bold">{todayCount}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{new Set(myAppointments.map((a) => a.patientId)).size}</div></CardContent>
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

      {/* Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments.</p>}
          {myAppointments.map((apt) => {
            const rx = getPrescriptionByAppointment(apt.id);
            return (
              <div key={apt.id} className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {apt.patientName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">Age: {apt.patientAge || "—"} • {apt.patientMedicalHistory || "No history"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3" />{apt.date}
                        <Clock className="h-3 w-3 ml-1" />{apt.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                    <span className={`text-[11px] ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                      Rx: {rx ? "Given" : "Not Given"}
                    </span>
                  </div>
                </div>

                {apt.status === "Booked" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStartConsultation(apt.id)}>Start Consultation</Button>
                    <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(apt.id)}>Mark Completed</Button>
                  </div>
                )}

                {apt.status === "In Progress" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/video/${apt.id}`)}>Rejoin Video</Button>
                    <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(apt.id)}>Mark Completed</Button>
                  </div>
                )}

                {apt.status === "Completed" && !rx && (
                  <Button size="sm" variant="outline" onClick={() => setRxAppointmentId(apt.id)}>
                    <FileText className="mr-2 h-4 w-4" /> Add Prescription
                  </Button>
                )}

                {apt.status === "Completed" && rx && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>
                    View Prescription
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Prescription Form */}
      {rxAppointmentId && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Write Prescription</CardTitle>
            <p className="text-sm text-muted-foreground">
              For: {myAppointments.find((a) => a.id === rxAppointmentId)?.patientName}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Medicine Name" value={rxForm.medicineName} onChange={(e) => setRxForm((p) => ({ ...p, medicineName: e.target.value }))} />
            <Input placeholder="Dosage (e.g. 10mg)" value={rxForm.dosage} onChange={(e) => setRxForm((p) => ({ ...p, dosage: e.target.value }))} />
            <Input placeholder="Duration (e.g. 7 days)" value={rxForm.duration} onChange={(e) => setRxForm((p) => ({ ...p, duration: e.target.value }))} />
            <Textarea placeholder="Instructions" value={rxForm.instructions} onChange={(e) => setRxForm((p) => ({ ...p, instructions: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSavePrescription} disabled={!rxForm.medicineName}>Save Prescription</Button>
              <Button size="sm" variant="ghost" onClick={() => setRxAppointmentId(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorDashboard;

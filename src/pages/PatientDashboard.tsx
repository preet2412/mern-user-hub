import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, FileText, Activity, IndianRupee, Stethoscope, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const { user, users } = useAuth();
  const { appointments, bookAppointment, getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const doctors = users.filter((u) => u.role === "doctor");
  const myAppointments = appointments.filter((a) => a.patientId === user?.id);

  // Search / Filter state
  const [filterSpec, setFilterSpec] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  // Booking state
  const [bookingDoctor, setBookingDoctor] = useState<string | null>(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");

  const specializations = useMemo(() => {
    const specs = new Set(doctors.map((d) => d.specialization).filter(Boolean));
    return Array.from(specs) as string[];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (filterSpec && doc.specialization !== filterSpec) return false;
      if (filterLocation && !doc.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterDate || filterTime) {
        const hasMatchingSlot = doc.availableSlots?.some((slot) => {
          if (filterDate && filterTime) return slot.date === filterDate && slot.time === filterTime;
          if (filterDate) return slot.date === filterDate;
          if (filterTime) return slot.time === filterTime;
          return true;
        });
        if (!hasMatchingSlot) return false;
      }
      return true;
    });
  }, [doctors, filterSpec, filterLocation, filterDate, filterTime]);

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
      location: doc.location,
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

      {/* Search Doctors */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Search Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Input
              placeholder="Location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Input
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Available Doctors ({filteredDoctors.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => (
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
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {doc.location || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">₹{doc.consultationFee}</span>
                  </span>
                </div>
                {doc.availableSlots && doc.availableSlots.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Available Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.availableSlots.slice(0, 4).map((slot, i) => (
                        <span key={i} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                          {slot.date} {slot.time}
                        </span>
                      ))}
                      {doc.availableSlots.length > 4 && (
                        <span className="text-[11px] text-muted-foreground">+{doc.availableSlots.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}

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
          {filteredDoctors.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No doctors match your search criteria.</p>
          )}
        </div>
      </div>

      {/* My Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
          {myAppointments.map((apt) => {
            const rx = getPrescriptionByAppointment(apt.id);
            return (
              <div key={apt.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">{apt.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{apt.specialization}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3 w-3" />{apt.date}
                    <Clock className="h-3 w-3 ml-1" />{apt.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                  <span className={`text-[11px] ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                    Prescription: {rx ? "Given" : "Not Given"}
                  </span>
                  {apt.status === "Completed" && rx && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>
                      View Prescription
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;

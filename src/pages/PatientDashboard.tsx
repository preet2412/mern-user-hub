import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, FileText, Activity, IndianRupee, Stethoscope, MapPin, Search, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PatientDashboard = () => {
  const { user, users } = useAuth();
  const { appointments, bookAppointment, getPrescriptionByAppointment, isSlotBooked } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();

  const doctors = users.filter((u) => u.role === "doctor");
  const myAppointments = appointments.filter((a) => a.patientId === user?.id);
  const upcomingCount = myAppointments.filter((a) => a.status === "Booked" || a.status === "Accepted").length;

  // Search state
  const [filterSpec, setFilterSpec] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Booking state
  const [bookingDoctor, setBookingDoctor] = useState<string | null>(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");

  const specializations = useMemo(() => {
    const specs = new Set(doctors.map((d) => d.specialization).filter(Boolean));
    return Array.from(specs) as string[];
  }, [doctors]);

  const nameSuggestions = useMemo(() => {
    if (!filterName.trim()) return [];
    const lower = filterName.toLowerCase();
    return doctors
      .filter((d) => `${d.firstName} ${d.lastName}`.toLowerCase().startsWith(lower) || d.firstName.toLowerCase().startsWith(lower) || d.lastName.toLowerCase().startsWith(lower))
      .map((d) => `Dr. ${d.firstName} ${d.lastName}`)
      .slice(0, 5);
  }, [doctors, filterName]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (filterSpec && doc.specialization !== filterSpec) return false;
      if (filterLocation && !doc.location?.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterName) {
        const name = `${doc.firstName} ${doc.lastName}`.toLowerCase();
        if (!name.includes(filterName.toLowerCase().replace("dr. ", ""))) return false;
      }
      return true;
    });
  }, [doctors, filterSpec, filterLocation, filterName]);

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDay();
  };

  const isDayAvailable = (doc: typeof doctors[0], dateStr: string) => {
    if (!dateStr || !doc.availableDays) return false;
    return doc.availableDays.includes(getDayName(dateStr));
  };

  const handleBook = () => {
    const doc = doctors.find((d) => d.id === bookingDoctor);
    if (!doc || !user || !bookDate || !bookTime) return;
    if (isSlotBooked(doc.id, bookDate, bookTime)) {
      toast({ title: "Slot already booked", description: "Please select another slot.", variant: "destructive" });
      return;
    }
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
      consultationFee: doc.consultationFee,
    });
    toast({ title: "Appointment booked successfully!" });
    setBookingDoctor(null);
    setBookDate("");
    setBookTime("");
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Booked": return "text-primary";
      case "Accepted": return "text-secondary";
      case "In Progress": return "text-warning";
      case "Completed": return "text-secondary";
      case "Cancelled": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const today = "2026-02-14";

  const canJoinVideo = (apt: typeof myAppointments[0]) => {
    return apt.status === "Accepted" && apt.date === today;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.firstName}. Manage your health journey here.</p>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/patient/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to view all →</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/profile")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Age</CardTitle>
            <Activity className="h-5 w-5 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user?.age || "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to edit →</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/patient/history")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical History</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{user?.medicalHistory || "None recorded"}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to view records →</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Doctors */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Search Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="Location" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
            <div className="relative">
              <Input
                placeholder="Doctor Name"
                value={filterName}
                onChange={(e) => { setFilterName(e.target.value); setShowNameSuggestions(true); }}
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
              />
              {showNameSuggestions && nameSuggestions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full rounded-md border bg-card shadow-lg">
                  {nameSuggestions.map((name) => (
                    <button
                      key={name}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onMouseDown={() => { setFilterName(name); setShowNameSuggestions(false); }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Available Doctors ({filteredDoctors.length})</h2>
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
                      <Stethoscope className="h-3 w-3" /> {doc.specialization}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {doc.location || "N/A"}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> <span className="font-semibold text-foreground">₹{doc.consultationFee}</span></span>
                </div>

                {/* Available Days */}
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Available Days:</p>
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map((day, i) => (
                      <span key={day} className={`rounded-full px-2 py-0.5 text-[11px] ${
                        doc.availableDays?.includes(i)
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive/10 text-destructive line-through"
                      }`}>
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Slots */}
                {doc.availableSlots && doc.availableSlots.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium text-foreground mb-1">Time Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.availableSlots.map((slot) => (
                        <span key={slot} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {bookingDoctor === doc.id ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Input type="date" value={bookDate} onChange={(e) => { setBookDate(e.target.value); setBookTime(""); }} />
                    {bookDate && !isDayAvailable(doc, bookDate) && (
                      <p className="text-xs text-destructive">Doctor is not available on {DAYS[getDayName(bookDate)]}s.</p>
                    )}
                    {bookDate && isDayAvailable(doc, bookDate) && doc.availableSlots && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Select a time slot:</p>
                        <div className="flex flex-wrap gap-1">
                          {doc.availableSlots.map((slot) => {
                            const booked = isSlotBooked(doc.id, bookDate, slot);
                            return (
                              <button
                                key={slot}
                                disabled={booked}
                                onClick={() => setBookTime(slot)}
                                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                                  booked
                                    ? "bg-destructive/10 text-destructive border-destructive/30 cursor-not-allowed line-through"
                                    : bookTime === slot
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-foreground border-border hover:bg-accent cursor-pointer"
                                }`}
                              >
                                {slot} {booked && "(Booked)"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={handleBook} disabled={!bookDate || !bookTime || !isDayAvailable(doc, bookDate)}>Confirm Booking</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setBookingDoctor(null); setBookDate(""); setBookTime(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => setBookingDoctor(doc.id)}>Book Appointment</Button>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredDoctors.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No doctors match your search criteria.</p>
          )}
        </div>
      </div>

      {/* Recent Appointments Preview */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Appointments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/patient/appointments")}>View All</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {myAppointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments yet.</p>}
          {myAppointments.slice(0, 5).map((apt) => {
            const rx = getPrescriptionByAppointment(apt.id);
            return (
              <div key={apt.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium">{apt.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{apt.specialization} • {apt.location}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3 w-3" />{apt.date}
                    <Clock className="h-3 w-3 ml-1" />{apt.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-semibold ${statusColor(apt.status)}`}>{apt.status}</span>
                  <span className={`text-[11px] ${rx ? "text-secondary font-semibold" : "text-muted-foreground"}`}>
                    Rx: {rx ? "Given" : "Not Given"}
                  </span>
                  {canJoinVideo(apt) && (
                    <Button size="sm" onClick={() => navigate(`/video/${apt.id}`)} className="gap-1">
                      <Video className="h-3 w-3" /> Join Video
                    </Button>
                  )}
                  {apt.status === "Completed" && rx && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/prescription/${apt.id}`)}>View Prescription</Button>
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

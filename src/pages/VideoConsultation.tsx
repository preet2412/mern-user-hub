import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClinic } from "@/contexts/ClinicContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, PhoneOff, FileText, X } from "lucide-react";

const VideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { appointments, updateAppointmentStatus, addPrescription } = useClinic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const apt = appointments.find((a) => a.id === appointmentId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // Prescription modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({ medicineName: "", dosage: "", duration: "", instructions: "" });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      })
      .catch(() => {});

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMuted((p) => !p);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraOff((p) => !p);
    }
  };

  const handleSavePrescription = () => {
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
    setShowRxModal(false);
    setRxForm({ medicineName: "", dosage: "", duration: "", instructions: "" });
  };

  const endCall = () => {
    stream?.getTracks().forEach((t) => t.stop());
    if (apt) {
      updateAppointmentStatus(apt.id, "Completed");
    }
    navigate(user?.role === "doctor" ? "/doctor" : "/patient");
  };

  if (!apt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Appointment not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Consultation</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "doctor" ? `Patient: ${apt.patientName}` : `Doctor: ${apt.doctorName}`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Local Video */}
        <Card className="border-0 shadow-md flex-1 overflow-hidden">
          <div className="aspect-video bg-muted flex items-center justify-center rounded-lg overflow-hidden relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {cameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground py-2">You</p>
        </Card>

        {/* Remote Video (placeholder) */}
        <Card className="border-0 shadow-md flex-1 overflow-hidden">
          <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
            <div className="text-center space-y-2">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">Waiting for remote participant...</p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground py-2">
            {user?.role === "doctor" ? apt.patientName : apt.doctorName}
          </p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant={muted ? "destructive" : "outline"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleMute}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          variant={cameraOff ? "destructive" : "outline"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleCamera}
        >
          {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        {user?.role === "doctor" && (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowRxModal(true)}
          >
            <FileText className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="destructive"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={endCall}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {/* Prescription Modal */}
      {showRxModal && user?.role === "doctor" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <Card className="w-full max-w-md mx-4 border-0 shadow-xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Add Prescription</h3>
                <Button size="icon" variant="ghost" onClick={() => setShowRxModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Patient: {apt.patientName}</p>
              <Input placeholder="Medicine Name" value={rxForm.medicineName} onChange={(e) => setRxForm((p) => ({ ...p, medicineName: e.target.value }))} />
              <Input placeholder="Dosage (e.g. 10mg)" value={rxForm.dosage} onChange={(e) => setRxForm((p) => ({ ...p, dosage: e.target.value }))} />
              <Input placeholder="Duration (e.g. 7 days)" value={rxForm.duration} onChange={(e) => setRxForm((p) => ({ ...p, duration: e.target.value }))} />
              <Textarea placeholder="Instructions" value={rxForm.instructions} onChange={(e) => setRxForm((p) => ({ ...p, instructions: e.target.value }))} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePrescription} disabled={!rxForm.medicineName}>Save Prescription</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRxModal(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoConsultation;

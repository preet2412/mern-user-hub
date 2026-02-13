import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClinic } from "@/contexts/ClinicContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const VideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { appointments } = useClinic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const apt = appointments.find((a) => a.id === appointmentId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      })
      .catch(() => {
        // Camera/mic not available — still show UI
      });

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

  const endCall = () => {
    stream?.getTracks().forEach((t) => t.stop());
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
          <div className="aspect-video bg-muted flex items-center justify-center rounded-lg overflow-hidden">
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
        <Button
          variant="destructive"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={endCall}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoConsultation;

import { useParams, useNavigate } from "react-router-dom";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer, ArrowLeft } from "lucide-react";

const ViewPrescription = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { getPrescriptionByAppointment } = useClinic();
  const navigate = useNavigate();

  const rx = appointmentId ? getPrescriptionByAppointment(appointmentId) : undefined;

  if (!rx) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Prescription not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription</h1>
          <p className="text-muted-foreground mt-1">Appointment #{appointmentId}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{rx.doctorName}</CardTitle>
              <p className="text-xs text-muted-foreground">Date: {rx.date}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium">{rx.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{rx.date}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Medicine</p>
                <p className="font-medium">{rx.medicineName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dosage</p>
                <p className="font-medium">{rx.dosage}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">{rx.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Instructions</p>
                <p className="font-medium">{rx.instructions}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
    </div>
  );
};

export default ViewPrescription;

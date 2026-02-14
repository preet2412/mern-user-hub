import React, { createContext, useContext, useState, useCallback } from "react";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientMedicalHistory?: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  location?: string;
  date: string;
  time: string;
  status: "Booked" | "Accepted" | "In Progress" | "Completed" | "Cancelled";
  cancelReason?: string;
  consultationFee?: number;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface ClinicContextType {
  appointments: Appointment[];
  prescriptions: Prescription[];
  bookAppointment: (apt: Omit<Appointment, "id" | "status">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  acceptAppointment: (id: string) => void;
  rejectAppointment: (id: string, reason: string) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  addPrescription: (rx: Omit<Prescription, "id">) => void;
  getPrescriptionByAppointment: (appointmentId: string) => Prescription | undefined;
  isSlotBooked: (doctorId: string, date: string, time: string) => boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "John Doe",
    patientAge: 32,
    patientMedicalHistory: "No significant history",
    doctorId: "doc-1",
    doctorName: "Dr. Rajesh Sharma",
    specialization: "Cardiology",
    location: "Mumbai",
    date: "2026-02-14",
    time: "10:00",
    status: "Accepted",
    consultationFee: 500,
  },
  {
    id: "apt-2",
    patientId: "pat-2",
    patientName: "Jane Smith",
    patientAge: 28,
    patientMedicalHistory: "Mild asthma",
    doctorId: "doc-2",
    doctorName: "Dr. Priya Patel",
    specialization: "Dermatology",
    location: "Delhi",
    date: "2026-02-13",
    time: "15:00",
    status: "Completed",
    consultationFee: 400,
  },
  {
    id: "apt-3",
    patientId: "pat-1",
    patientName: "John Doe",
    patientAge: 32,
    patientMedicalHistory: "No significant history",
    doctorId: "doc-4",
    doctorName: "Dr. Sita Reddy",
    specialization: "General Medicine",
    location: "Bangalore",
    date: "2026-02-12",
    time: "10:00",
    status: "Cancelled",
    cancelReason: "Doctor unavailable due to emergency",
    consultationFee: 300,
  },
  {
    id: "apt-4",
    patientId: "pat-1",
    patientName: "John Doe",
    patientAge: 32,
    patientMedicalHistory: "No significant history",
    doctorId: "doc-3",
    doctorName: "Dr. Amit Gupta",
    specialization: "Orthopedics",
    location: "Mumbai",
    date: "2026-02-15",
    time: "12:00",
    status: "Booked",
    consultationFee: 600,
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: "rx-1",
    appointmentId: "apt-2",
    doctorId: "doc-2",
    doctorName: "Dr. Priya Patel",
    patientId: "pat-2",
    patientName: "Jane Smith",
    date: "2026-02-13",
    medicineName: "Cetirizine",
    dosage: "10mg",
    duration: "7 days",
    instructions: "Take once daily after meals",
  },
];

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);

  const bookAppointment = useCallback((apt: Omit<Appointment, "id" | "status">) => {
    const newApt: Appointment = { ...apt, id: `apt-${Date.now()}`, status: "Booked" };
    setAppointments((prev) => [...prev, newApt]);
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: Appointment["status"]) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const acceptAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Accepted" as const } : a)));
  }, []);

  const rejectAppointment = useCallback((id: string, reason: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" as const, cancelReason: reason } : a))
    );
  }, []);

  const cancelAppointment = useCallback((id: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" as const, cancelReason: reason || "Cancelled by admin" } : a))
    );
  }, []);

  const addPrescription = useCallback((rx: Omit<Prescription, "id">) => {
    setPrescriptions((prev) => [...prev, { ...rx, id: `rx-${Date.now()}` }]);
  }, []);

  const getPrescriptionByAppointment = useCallback(
    (appointmentId: string) => prescriptions.find((p) => p.appointmentId === appointmentId),
    [prescriptions]
  );

  const isSlotBooked = useCallback(
    (doctorId: string, date: string, time: string) => {
      return appointments.some(
        (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "Cancelled"
      );
    },
    [appointments]
  );

  return (
    <ClinicContext.Provider
      value={{
        appointments,
        prescriptions,
        bookAppointment,
        updateAppointmentStatus,
        acceptAppointment,
        rejectAppointment,
        cancelAppointment,
        addPrescription,
        getPrescriptionByAppointment,
        isSlotBooked,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error("useClinic must be used within ClinicProvider");
  return context;
};

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
  date: string;
  time: string;
  status: "Booked" | "In Progress" | "Completed" | "Cancelled";
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
  addPrescription: (rx: Omit<Prescription, "id">) => void;
  getPrescriptionByAppointment: (appointmentId: string) => Prescription | undefined;
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
    date: "2026-02-13",
    time: "10:00",
    status: "Booked",
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
    date: "2026-02-15",
    time: "15:00",
    status: "Completed",
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
    date: "2026-02-15",
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

  const addPrescription = useCallback((rx: Omit<Prescription, "id">) => {
    setPrescriptions((prev) => [...prev, { ...rx, id: `rx-${Date.now()}` }]);
  }, []);

  const getPrescriptionByAppointment = useCallback(
    (appointmentId: string) => prescriptions.find((p) => p.appointmentId === appointmentId),
    [prescriptions]
  );

  return (
    <ClinicContext.Provider
      value={{ appointments, prescriptions, bookAppointment, updateAppointmentStatus, addPrescription, getPrescriptionByAppointment }}
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

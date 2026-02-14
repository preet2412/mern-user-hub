import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAppointments from "./pages/AdminAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorTodayAppointments from "./pages/DoctorTodayAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/PatientAppointments";
import PatientMedicalHistory from "./pages/PatientMedicalHistory";
import VideoConsultation from "./pages/VideoConsultation";
import ViewPrescription from "./pages/ViewPrescription";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClinicProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
                {/* Doctor */}
                <Route path="/doctor" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/today" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorTodayAppointments /></ProtectedRoute>} />
                <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />
                {/* Patient */}
                <Route path="/patient" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
                <Route path="/patient/history" element={<ProtectedRoute allowedRoles={["patient"]}><PatientMedicalHistory /></ProtectedRoute>} />
                {/* Shared */}
                <Route path="/video/:appointmentId" element={<ProtectedRoute allowedRoles={["doctor", "patient"]}><VideoConsultation /></ProtectedRoute>} />
                <Route path="/prescription/:appointmentId" element={<ProtectedRoute allowedRoles={["doctor", "patient", "admin"]}><ViewPrescription /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Chatbot />
          </ClinicProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

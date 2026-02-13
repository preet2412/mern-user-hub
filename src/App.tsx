import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
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
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor"
                  element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/video/:appointmentId"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                      <VideoConsultation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prescription/:appointmentId"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                      <ViewPrescription />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ClinicProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

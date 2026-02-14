import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Owner
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerAuditLog from "./pages/owner/OwnerAuditLog";

// Doctor
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Receptionist
import ReceptionistLogin from "./pages/receptionist/ReceptionistLogin";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";

// Patient
import PatientLogin from "./pages/patient/PatientLogin";
import PatientDashboard from "./pages/patient/PatientDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Owner Routes */}
                <Route path="/owner/login" element={<OwnerLogin />} />
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/doctors" element={<OwnerDashboard />} />
                <Route path="/owner/receptionists" element={<OwnerDashboard />} />
                <Route path="/owner/audit" element={<OwnerAuditLog />} />
                
                {/* Doctor Routes */}
                <Route path="/doctor/login" element={<DoctorLogin />} />
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<DoctorDashboard />} />
                <Route path="/doctor/schedule" element={<DoctorDashboard />} />
                
                {/* Receptionist Routes */}
                <Route path="/receptionist/login" element={<ReceptionistLogin />} />
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/patients" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/calendar" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/doctors" element={<ReceptionistDashboard />} />
                
                {/* Patient Routes */}
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/appointments" element={<PatientDashboard />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

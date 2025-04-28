
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMerchants from "./pages/admin/AdminMerchants";
import CreateMerchant from "./pages/admin/CreateMerchant";
import AdminOffers from "./pages/admin/AdminOffers";
import OfferDetail from "./pages/admin/OfferDetail";

// Merchant Pages
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantOffers from "./pages/merchant/MerchantOffers";
import MerchantOfferDetail from "./pages/merchant/MerchantOfferDetail";
import CreateOffer from "./pages/merchant/CreateOffer";
import MerchantProfile from "./pages/merchant/MerchantProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout requiredRole="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="merchants" element={<AdminMerchants />} />
              <Route path="merchants/new" element={<CreateMerchant />} />
              <Route path="offers" element={<AdminOffers />} />
              <Route path="offers/:id" element={<OfferDetail />} />
              <Route path="settings" element={<div>Admin Settings</div>} />
            </Route>
            
            {/* Merchant Routes */}
            <Route path="/merchant" element={<DashboardLayout requiredRole="merchant" />}>
              <Route index element={<MerchantDashboard />} />
              <Route path="offers" element={<MerchantOffers />} />
              <Route path="offers/new" element={<CreateOffer />} />
              <Route path="offers/:id" element={<MerchantOfferDetail />} />
              <Route path="profile" element={<MerchantProfile />} />
              <Route path="settings" element={<div>Merchant Settings</div>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

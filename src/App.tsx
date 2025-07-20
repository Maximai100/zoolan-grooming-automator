
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/Dashboard";
import ClientsPage from "./components/ClientsPage";
import CalendarPage from "./components/CalendarPage";
import POSPage from "./components/POSPage";
import NotificationsPage from "./components/NotificationsPage";
import AnalyticsPage from "./components/AnalyticsPage";
import StaffPage from "./components/StaffPage";
import ServicesPage from "./components/ServicesPage";
import SettingsPage from "./components/SettingsPage";
import LoyaltyPage from "./components/LoyaltyPage";
import InventoryPage from "./components/InventoryPage";
import SubscriptionPage from "./components/SubscriptionPage";
import DataExportPage from "./components/DataExportPage";
import SecurityPage from "./components/SecurityPage";
import MessengersPage from "./components/MessengersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/landing" element={<Index />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="loyalty" element={<LoyaltyPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="exports" element={<DataExportPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="messengers" element={<MessengersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { PosLayout } from "@/components/layout/PosLayout";
import Login from "./pages/Login";
import Pos from "./pages/Pos";
import Inventory from "./pages/Inventory";
import Receipts from "./pages/Receipts";
import Shifts from "./pages/Shifts";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/pos" replace />} />
            
            {/* Protected routes */}
            <Route element={<PosLayout />}>
              <Route path="/pos" element={<Pos />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

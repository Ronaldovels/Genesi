


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { AuthProvider } from "./contexts/AuthContext";

// Páginas

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Plano from "./pages/Plano";
import Futuro from "./pages/Futuro";
import Investimentos from "./pages/Investimentos";

import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plano" element={<Plano />} />
        <Route path="/futuro" element={<Futuro />} />
        <Route path="/investimentos" element={<Investimentos />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};


import InsightsPage from "./pages/Insights";
import NotFound from "./pages/NotFound";

// Componentes
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          
          <AppRoutes />

          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plano" element={<Plano />} />
              <Route path="/futuro" element={<Futuro />} />
              <Route path="/investimentos" element={<Investimentos />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>

            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

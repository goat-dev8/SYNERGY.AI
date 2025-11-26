import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Liquidity from "./pages/Liquidity";
import Identity from "./pages/Identity";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page without layout */}
          <Route path="/" element={<Landing />} />
          
          {/* App pages with layout */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/agents"
            element={
              <AppLayout>
                <Agents />
              </AppLayout>
            }
          />
          <Route
            path="/agents/:id"
            element={
              <AppLayout>
                <AgentDetail />
              </AppLayout>
            }
          />
          <Route
            path="/liquidity"
            element={
              <AppLayout>
                <Liquidity />
              </AppLayout>
            }
          />
          <Route
            path="/identity"
            element={
              <AppLayout>
                <Identity />
              </AppLayout>
            }
          />
          <Route
            path="/activity"
            element={
              <AppLayout>
                <Activity />
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

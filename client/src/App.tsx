import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load components for code splitting
const LandingPage = lazy(() => import("@/components/LandingPage").then(m => ({ default: m.LandingPage })));
const Workbench = lazy(() => import("@/components/Workbench").then(m => ({ default: m.Workbench })));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function AuthenticatedRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<div className="h-screen bg-slate-950" />}>
      <Switch>
        <Route path="/">
          {isAuthenticated ? <Workbench /> : <LandingPage />}
        </Route>
        <Route path="/workbench">
          <Workbench />
        </Route>
        <Route path="/app">
          <Workbench />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

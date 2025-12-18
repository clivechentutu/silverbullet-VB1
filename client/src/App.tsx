import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LandingPage } from "@/components/LandingPage";
import { Workbench } from "@/components/Workbench";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
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
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Workbench /> : <LandingPage />}
      </Route>
      <Route path="/workbench">
        <ProtectedRoute component={Workbench} />
      </Route>
      <Route component={NotFound} />
    </Switch>
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

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Companies from "@/pages/admin/Companies";
import Charges from "@/pages/admin/Charges";
import Users from "@/pages/admin/Users";
import MyCharges from "@/pages/company/MyCharges";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes - Wrapped in Layout */}
      <Route path="/admin/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/admin/companies">
        <Layout><Companies /></Layout>
      </Route>
      <Route path="/admin/charges">
        <Layout><Charges /></Layout>
      </Route>
      <Route path="/admin/users">
        <Layout><Users /></Layout>
      </Route>
      <Route path="/portal/charges">
        <Layout><MyCharges /></Layout>
      </Route>

      {/* Redirect root to login */}
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

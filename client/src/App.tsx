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
import AdminInvoices from "@/pages/admin/Invoices";
import Users from "@/pages/admin/Users";
import MyCharges from "@/pages/company/MyCharges";
import MyInvoices from "@/pages/company/MyInvoices";
import NotFound from "@/pages/NotFound";
import { PasswordChange } from "@/pages/auth/PasswordChange";

function Router() {
  const { user } = useAuth();

  if (user?.forcePasswordChange) {
    return (
      <Switch>
        <Route path="/change-password" component={PasswordChange} />
        <Route>
          <Redirect to="/change-password" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/admin/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/admin/companies">
        <Layout><Companies /></Layout>
      </Route>
      <Route path="/admin/charges">
        <Layout><Charges /></Layout>
      </Route>
      <Route path="/admin/invoices">
        <Layout><AdminInvoices /></Layout>
      </Route>
      <Route path="/admin/users">
        <Layout><Users /></Layout>
      </Route>
      <Route path="/portal/charges">
        <Layout><MyCharges /></Layout>
      </Route>
      <Route path="/portal/invoices">
        <Layout><MyInvoices /></Layout>
      </Route>

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

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Receipt, 
  Users, 
  LogOut,
  PieChart,
  FileText,
  Settings,
  Settings2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const adminLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/admin/companies", icon: Building2, label: "Empresas" },
    { href: "/admin/charges", icon: Receipt, label: "Cobranças" },
    { href: "/admin/invoices", icon: FileText, label: "Notas Fiscais" },
    { href: "/admin/contracts", icon: FileText, label: "Contratos" },
    { href: "/admin/equipment", icon: Settings, label: "Equipamentos" },
    { href: "/admin/equipment-models", icon: Settings2, label: "Modelos" },
    { href: "/admin/users", icon: Users, label: "Usuários" },
  ];

  const companyLinks = [
    { href: "/portal/charges", icon: Receipt, label: "Minhas Cobranças" },
    { href: "/portal/invoices", icon: FileText, label: "Minhas Notas Fiscais" },
  ];

  const links = user?.role === "admin" ? adminLinks : companyLinks;

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">FinControl</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

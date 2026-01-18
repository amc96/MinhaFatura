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
  Settings2,
  ListPlus,
  Wallet,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Cadastro": true,
    "Financeiro": true
  });

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const adminSections = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Painel" },
    {
      label: "Cadastro",
      icon: ListPlus,
      items: [
        { href: "/admin/companies", icon: Building2, label: "Empresa" },
        { href: "/admin/equipment-models", icon: Settings2, label: "Modelo" },
        { href: "/admin/equipment", icon: Settings, label: "Equipamento" },
        { href: "/admin/users", icon: Users, label: "Usuário" },
        { href: "/admin/contracts", icon: FileText, label: "Contratos" },
      ]
    },
    {
      label: "Financeiro",
      icon: Wallet,
      items: [
        { href: "/admin/invoices", icon: FileText, label: "Notas Fiscais" },
        { href: "/admin/charges", icon: Receipt, label: "Faturas" },
      ]
    },
  ];

  const companySections = [
    {
      label: "Financeiro",
      icon: Wallet,
      items: [
        { href: "/portal/invoices", icon: FileText, label: "Minhas Notas Fiscais" },
        { href: "/portal/charges", icon: Receipt, label: "Minhas Faturas" },
      ]
    }
  ];

  const sections = user?.role === "admin" ? adminSections : companySections;

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">FinControl</span>
      </div>

      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.href ? (
              <Link href={section.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    location === section.href
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <section.icon className={cn("w-5 h-5", location === section.href ? "text-white" : "text-slate-500")} />
                  {section.label}
                </div>
              </Link>
            ) : (
              <>
                <div 
                  className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => toggleSection(section.label)}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </div>
                  {openSections[section.label] ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>
                {openSections[section.label] && (
                  <div className="space-y-1 ml-2 border-l border-slate-800 pl-2 animate-in slide-in-from-top-1 duration-200">
                    {section.items?.map((link) => {
                      const isActive = location === link.href;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <link.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                            {link.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
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

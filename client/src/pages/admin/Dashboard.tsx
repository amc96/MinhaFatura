import { useCharges } from "@/hooks/use-charges";
import { useCompanies } from "@/hooks/use-companies";
import { StatCard } from "@/components/ui/StatCard";
import { Users, Receipt, AlertCircle, DollarSign, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

export default function Dashboard() {
  const { data: charges } = useCharges();
  const { data: companies } = useCompanies();

  const totalRevenue = charges?.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0) || 0;
  const pendingRevenue = charges?.filter(c => c.status === 'pending').reduce((acc, curr) => Number(acc) + Number(curr.amount), 0) || 0;
  const overdueCount = charges?.filter(c => c.status === 'overdue').length || 0;
  
  // Data for chart: Revenue by month
  const chartData = charges?.reduce((acc: any[], charge) => {
    const month = format(new Date(charge.dueDate), 'MMM');
    const existing = acc.find(item => item.name === month);
    if (existing) {
      existing.total += Number(charge.amount);
    } else {
      acc.push({ name: month, total: Number(charge.amount) });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-2">Overview of financial performance and metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Companies"
          value={companies?.length || 0}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Pending Amount"
          value={`R$ ${pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Receipt}
          color="amber"
        />
        <StatCard
          title="Overdue Charges"
          value={overdueCount}
          icon={AlertCircle}
          color="red"
          description="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies?.slice(0, 5).map(company => (
                <div key={company.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{company.email}</p>
                  </div>
                </div>
              ))}
              {(!companies || companies.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No companies registered yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { useCharges } from "@/hooks/use-charges";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function MyCharges() {
  const { user } = useAuth();
  const { data: charges, isLoading } = useCharges(user?.companyId ?? undefined);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chargesWithInvoices = charges?.filter(c => c.invoiceFile);
  const pendingAmount = charges?.filter(c => c.status === 'pending').reduce((acc, curr) => Number(acc) + Number(curr.amount), 0) || 0;
  const overdueAmount = charges?.filter(c => c.status === 'overdue').reduce((acc, curr) => Number(acc) + Number(curr.amount), 0) || 0;

  const ChargeTable = ({ data, emptyMessage }: { data: typeof charges, emptyMessage: string }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((charge) => (
          <TableRow key={charge.id} className="table-row-hover">
            <TableCell className="font-medium">{charge.title}</TableCell>
            <TableCell>R$ {Number(charge.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
            <TableCell>{format(new Date(charge.dueDate), 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              <StatusBadge status={charge.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {charge.boletoFile ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(charge.boletoFile!, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                    Boleto
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground mr-2">Sem boleto</span>
                )}
                
                {charge.invoiceFile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0"
                    onClick={() => window.open(charge.invoiceFile!, '_blank')}
                    title="Nota Fiscal"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data?.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Meu Financeiro</h1>
        <p className="text-slate-500 mt-2">Visualize suas faturas e notas fiscais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-6">
            <p className="text-amber-700 text-sm font-medium">Pagamento Pendente</p>
            <h3 className="text-2xl font-bold text-amber-900 mt-1">R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Atrasado</p>
              <h3 className="text-2xl font-bold text-red-900 mt-1">R$ {overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            {overdueAmount > 0 && <AlertCircle className="text-red-500 w-6 h-6" />}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charges" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-4">
          <TabsTrigger value="charges">Faturas</TabsTrigger>
          <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
        </TabsList>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <TabsContent value="charges" className="mt-0">
              <ChargeTable data={charges} emptyMessage="Você não possui faturas no momento." />
            </TabsContent>
            <TabsContent value="invoices" className="mt-0">
              <ChargeTable data={chargesWithInvoices} emptyMessage="Você não possui notas fiscais no momento." />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

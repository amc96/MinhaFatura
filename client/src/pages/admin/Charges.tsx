import { useCharges, useDeleteCharge } from "@/hooks/use-charges";
import { ChargeForm } from "@/components/forms/ChargeForm";
import { PaymentForm } from "@/components/forms/PaymentForm";
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
import { Loader2, Download, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Charges() {
  const { data: charges, isLoading } = useCharges();
  const deleteCharge = useDeleteCharge();

  const ChargeTable = ({ data, emptyMessage }: { data: any, emptyMessage: string }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
          <TableHead>Título</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Anexos</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((charge: any) => (
          <TableRow key={charge.id} className="table-row-hover">
            <TableCell className="font-medium">{charge.title}</TableCell>
            <TableCell>{charge.company.name}</TableCell>
            <TableCell>R$ {Number(charge.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
            <TableCell>{format(new Date(charge.dueDate), 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              <StatusBadge status={charge.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {charge.boletoFile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                    onClick={() => window.open(charge.boletoFile!, '_blank')}
                    title="Ver Boleto"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                {charge.invoiceFile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                    onClick={() => window.open(charge.invoiceFile!, '_blank')}
                    title="Ver Nota Fiscal"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <ChargeForm charge={charge} />
                {charge.status !== 'paid' && (
                  <PaymentForm chargeId={charge.id} chargeTitle={charge.title} />
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-slate-500 hover:text-destructive"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir esta cobrança?")) {
                      deleteCharge.mutate(charge.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data?.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-2">Acompanhe todas as faturas e notas fiscais.</p>
        </div>
        <ChargeForm />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ChargeTable data={charges} emptyMessage="Nenhuma cobrança encontrada." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

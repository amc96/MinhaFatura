import { useCharges } from "@/hooks/use-charges";
import { ChargeForm } from "@/components/forms/ChargeForm";
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
import { Loader2, Download, FileText } from "lucide-react";
import { format } from "date-fns";

export default function Charges() {
  const { data: charges, isLoading } = useCharges();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Charges</h1>
          <p className="text-slate-500 mt-2">Track all invoices and payments.</p>
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
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Attachments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges?.map((charge) => (
                  <TableRow key={charge.id} className="table-row-hover">
                    <TableCell className="font-medium">{charge.title}</TableCell>
                    <TableCell>{charge.company.name}</TableCell>
                    <TableCell>R$ {Number(charge.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{format(new Date(charge.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <StatusBadge status={charge.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {charge.boletoFile && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                            onClick={() => window.open(charge.boletoFile!, '_blank')}
                            title="View Boleto"
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
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {charges?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No charges found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

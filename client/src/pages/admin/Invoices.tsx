import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminInvoices() {
  const { data: invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notas Fiscais</h1>
          <p className="text-slate-500 mt-2">Gerencie as notas fiscais vinculadas às faturas.</p>
        </div>
        <InvoiceForm />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Empresa</TableHead>
                <TableHead>Fatura Relacionada</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id} className="table-row-hover">
                  <TableCell className="font-medium">{invoice.company.name}</TableCell>
                  <TableCell>{invoice.charge.title}</TableCell>
                  <TableCell>{format(new Date(invoice.createdAt!), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.open(invoice.fileUrl, '_blank')}
                      >
                        <FileText className="w-4 h-4" />
                        Visualizar
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-slate-500 hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta nota fiscal?")) {
                            deleteInvoice.mutate(invoice.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    Nenhuma nota fiscal cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useInvoices } from "@/hooks/use-invoices";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function MyInvoices() {
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices(user?.companyId ?? undefined);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Minhas Notas Fiscais</h1>
        <p className="text-slate-500 mt-2">Visualize suas notas fiscais vinculadas.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Fatura Relacionada</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id} className="table-row-hover">
                  <TableCell className="font-medium">{invoice.charge.title}</TableCell>
                  <TableCell>{format(new Date(invoice.createdAt!), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
              {invoices?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-slate-500">
                    Nenhuma nota fiscal disponível.
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

import { useCompanies, useDeleteCompany } from "@/hooks/use-companies";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Mail, MapPin, Building, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function Companies() {
  const { data: companies, isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-2">Gerencie as empresas clientes cadastradas.</p>
        </div>
        <CompanyForm />
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
                  <TableHead className="w-[250px]">Nome da Empresa</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Documento / IE</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cadastrada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies?.map((company) => (
                  <TableRow key={company.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          {company.contractType === 'service' ? 'Serviço' : 'Locação'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">{company.document}</span>
                        {company.stateRegistration && (
                          <span className="text-[10px] text-slate-500">IE: {company.stateRegistration}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{company.email}</span>
                        </div>
                        {company.whatsapp && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Whats: {company.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.address && (
                        <div className="flex items-center gap-2 text-slate-500 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3" />
                          {company.address}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {company.createdAt && format(new Date(company.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CompanyForm company={company} />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta empresa? Isso excluirá todas as cobranças e notas fiscais relacionadas.")) {
                              deleteCompany.mutate(company.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {companies?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhuma empresa encontrada. Crie uma para começar.
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

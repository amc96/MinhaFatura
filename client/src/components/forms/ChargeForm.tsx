import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChargeSchema, InsertCharge } from "@shared/schema";
import { useCreateCharge, useUploadFile } from "@/hooks/use-charges";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, FileText } from "lucide-react";
import { useState } from "react";

export function ChargeForm() {
  const [open, setOpen] = useState(false);
  const { data: companies } = useCompanies();
  const createCharge = useCreateCharge();
  const uploadFile = useUploadFile();
  
  const [boletoUploading, setBoletoUploading] = useState(false);
  const [invoiceUploading, setInvoiceUploading] = useState(false);

  const form = useForm<InsertCharge>({
    resolver: zodResolver(insertChargeSchema),
    defaultValues: {
      title: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: "pending",
      companyId: undefined,
      boletoFile: null,
      invoiceFile: null,
    },
  });

  const handleFileUpload = async (
    file: File, 
    field: "boletoFile" | "invoiceFile",
    setLoading: (l: boolean) => void
  ) => {
    setLoading(true);
    try {
      const { url } = await uploadFile.mutateAsync(file);
      form.setValue(field, url);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: InsertCharge) => {
    createCharge.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Nova Cobrança
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Criar Nova Cobrança</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título / Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Taxa de Serviço Mensal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <FormItem>
                <FormLabel>Boleto (PDF/Imagem)</FormLabel>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "boletoFile", setBoletoUploading);
                    }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="cursor-pointer"
                  />
                  {boletoUploading && <Upload className="w-4 h-4 animate-bounce text-primary" />}
                </div>
                {form.watch("boletoFile") && <p className="text-xs text-green-600 flex items-center gap-1"><FileText className="w-3 h-3"/> Carregado</p>}
              </FormItem>

              <FormItem>
                <FormLabel>Nota Fiscal (NF-e)</FormLabel>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "invoiceFile", setInvoiceUploading);
                    }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="cursor-pointer"
                  />
                  {invoiceUploading && <Upload className="w-4 h-4 animate-bounce text-primary" />}
                </div>
                {form.watch("invoiceFile") && <p className="text-xs text-green-600 flex items-center gap-1"><FileText className="w-3 h-3"/> Carregado</p>}
              </FormItem>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCharge.isPending || boletoUploading || invoiceUploading}>
                {createCharge.isPending ? "Salvando..." : "Criar Cobrança"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

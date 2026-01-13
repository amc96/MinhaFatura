import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema, type InsertInvoice } from "@shared/schema";
import { useCreateInvoice, useUploadFile } from "@/hooks/use-invoices";
import { useCharges } from "@/hooks/use-charges";
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

export function InvoiceForm() {
  const [open, setOpen] = useState(false);
  const { data: charges } = useCharges();
  const createInvoice = useCreateInvoice();
  const uploadFile = useUploadFile();
  
  const [uploading, setUploading] = useState(false);

  const form = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      chargeId: 0,
      companyId: 0,
      fileUrl: "",
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadFile.mutateAsync(file);
      form.setValue("fileUrl", url);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: InsertInvoice) => {
    if (!data.chargeId || !data.fileUrl) return;
    createInvoice.mutate(data as any, {
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
          Nova Nota Fiscal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Vincular Nota Fiscal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="chargeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fatura / Cobrança</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      const chargeId = Number(val);
                      const charge = charges?.find(c => c.id === chargeId);
                      field.onChange(chargeId);
                      if (charge) form.setValue("companyId", charge.companyId);
                    }} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fatura" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {charges?.map((charge) => (
                        <SelectItem key={charge.id} value={charge.id.toString()}>
                          {charge.title} - R$ {Number(charge.amount).toLocaleString('pt-BR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Arquivo da Nota Fiscal</FormLabel>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="cursor-pointer"
                />
                {uploading && <Upload className="w-4 h-4 animate-bounce text-primary" />}
              </div>
              {form.watch("fileUrl") && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <FileText className="w-3 h-3"/> Arquivo selecionado
                </p>
              )}
            </FormItem>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createInvoice.isPending || uploading}>
                {createInvoice.isPending ? "Salvando..." : "Salvar Nota Fiscal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

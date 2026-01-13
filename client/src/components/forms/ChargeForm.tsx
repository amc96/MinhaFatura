import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChargeSchema, type InsertCharge } from "@shared/schema";
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
  
  const [boletoUploading, setBoletoUploading] = useState<Record<number, boolean>>({});

  const form = useForm<InsertCharge & { recurringCount: number; intervalDays: number; installments: { dueDate: string; boletoFile: string | null }[] }>({
    resolver: zodResolver(insertChargeSchema),
    defaultValues: {
      title: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: "pending",
      companyId: undefined,
      boletoFile: null,
      recurringCount: 1,
      intervalDays: 30,
      installments: [],
    },
  });

  const recurringCount = form.watch("recurringCount");
  const intervalDays = form.watch("intervalDays");
  const startDate = form.watch("dueDate");

  const simulateInstallments = () => {
    const count = form.getValues("recurringCount");
    const interval = form.getValues("intervalDays");
    const start = new Date(form.getValues("dueDate"));
    
    const newInstallments = Array.from({ length: count }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + (i * interval));
      return {
        dueDate: d.toISOString().split('T')[0],
        boletoFile: null
      };
    });
    form.setValue("installments", newInstallments);
  };

  const handleFileUpload = async (
    file: File, 
    index: number
  ) => {
    setBoletoUploading(prev => ({ ...prev, [index]: true }));
    try {
      const { url } = await uploadFile.mutateAsync(file);
      const current = form.getValues("installments");
      current[index].boletoFile = url;
      form.setValue("installments", [...current]);
    } finally {
      setBoletoUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  const onSubmit = (data: InsertCharge & { recurringCount: number; intervalDays: number; installments: { dueDate: string; boletoFile: string | null }[] }) => {
    // If multiple installments, we send them to the backend which handles bulk creation
    // The backend route was already updated to handle recurringCount, but we might want to pass the specific files now.
    // Let's adjust the backend to accept an array of installments if provided.
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
                    <FormLabel>Primeiro Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurringCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Cobranças (até 12)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={12} 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (Dias)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {recurringCount > 1 && (
              <div className="space-y-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Simulação de Parcelas</h4>
                  <Button type="button" variant="outline" size="sm" onClick={simulateInstallments}>
                    Gerar Simulação
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {form.watch("installments").map((inst, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs p-2 border-b last:border-0">
                      <span className="font-bold w-6">{idx + 1}º</span>
                      <span className="flex-1">{inst.dueDate}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file" 
                          className="h-8 w-40 text-[10px]"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, idx);
                          }}
                        />
                        {boletoUploading[idx] && <Upload className="w-3 h-3 animate-bounce" />}
                        {inst.boletoFile && <FileText className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurringCount === 1 && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                <FormItem>
                  <FormLabel>Boleto (PDF/Imagem)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const upload = async () => {
                            const { url } = await uploadFile.mutateAsync(file);
                            form.setValue("boletoFile", url);
                          };
                          upload();
                        }
                      }}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="cursor-pointer"
                    />
                  </div>
                </FormItem>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCharge.isPending || Object.values(boletoUploading).some(Boolean)}>
                {createCharge.isPending ? "Salvando..." : recurringCount > 1 ? "Simular e Gerar Parcelas" : "Criar Cobrança"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractSchema, InsertContract, Company } from "@shared/schema";
import { useCreateContract } from "@/hooks/use-contracts";
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
import { Plus, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useCompanies } from "@/hooks/use-companies";

export function ContractForm() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { data: companies } = useCompanies();
  const createContract = useCreateContract();

  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      companyId: 0,
      type: "service",
      duration: "",
      fileUrl: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        form.setValue("fileUrl", data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: InsertContract) => {
    createContract.mutate(data, {
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
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Contrato</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(parseInt(val))} 
                    value={field.value ? field.value.toString() : ""}
                  >
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="service">Prestação de Serviço</SelectItem>
                      <SelectItem value="equipment_lease">Locação de Equipamentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo de Duração</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 12 meses" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Arquivo do Contrato</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="contract-file"
                      accept=".pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="contract-file"
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-md p-4 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {uploading ? "Enviando..." : form.watch("fileUrl") ? "Arquivo enviado" : "Clique para subir o arquivo"}
                      </span>
                    </label>
                  </div>
                  {form.watch("fileUrl") && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <FileText className="w-3 h-3" />
                      <span>Contrato anexado com sucesso</span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createContract.isPending || uploading}>
                {createContract.isPending ? "Criando..." : "Criar Contrato"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

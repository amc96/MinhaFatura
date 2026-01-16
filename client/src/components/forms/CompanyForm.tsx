import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema, InsertCompany, Company } from "@shared/schema";
import { useCreateCompany, useUpdateCompany } from "@/hooks/use-companies";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";

interface CompanyFormProps {
  company?: Company;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [open, setOpen] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: company?.name || "",
      document: company?.document || "",
      email: company?.email || "",
      address: company?.address || "",
      stateRegistration: company?.stateRegistration || "",
      whatsapp: company?.whatsapp || "",
    },
  });

  useEffect(() => {
    if (company && open) {
      form.reset({
        name: company.name,
        document: company.document,
        email: company.email,
        address: company.address,
        stateRegistration: company.stateRegistration || "",
        whatsapp: company.whatsapp || "",
      });
    }
  }, [company, open, form]);

  const fetchCnpjData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setLoadingCnpj(true);
    try {
      const response = await fetch(`/api/cnpj/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        form.setValue("name", data.name);
        form.setValue("email", data.email);
        form.setValue("address", data.address);
        form.setValue("stateRegistration", data.stateRegistration);
        form.setValue("whatsapp", data.whatsapp);
      }
    } finally {
      setLoadingCnpj(false);
    }
  };

  const onSubmit = (data: InsertCompany) => {
    if (company) {
      updateCompany.mutate({ id: company.id, data }, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    } else {
      createCompany.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {company ? (
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Empresa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? "Editar Empresa" : "Cadastrar Nova Empresa"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (CNPJ/CPF)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value.replace(/\D/g, '').length === 14) {
                            fetchCnpjData(e.target.value);
                          }
                        }}
                      />
                      {loadingCnpj && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stateRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000.000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp / Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua Business, 123" value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending}>
                {company ? (updateCompany.isPending ? "Salvando..." : "Salvar Alterações") : (createCompany.isPending ? "Criando..." : "Criar Empresa")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

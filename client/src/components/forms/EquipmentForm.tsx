import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEquipmentSchema, InsertEquipment, Equipment } from "@shared/schema";
import { useCreateEquipment, useUpdateEquipment } from "@/hooks/use-equipment";
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
import { Plus, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/use-companies";

interface EquipmentFormProps {
  equipment?: Equipment;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EquipmentForm({ equipment, open: externalOpen, onOpenChange: setExternalOpen }: EquipmentFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;

  const { data: companies } = useCompanies();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  const form = useForm<InsertEquipment>({
    resolver: zodResolver(insertEquipmentSchema),
    defaultValues: {
      companyId: 0,
      name: "",
      model: "",
      serialNumber: "",
      status: "active",
      lastMaintenance: null,
      nextMaintenance: null,
    },
  });

  useEffect(() => {
    if (equipment && open) {
      form.reset({
        companyId: equipment.companyId,
        name: equipment.name,
        model: equipment.model || "",
        serialNumber: equipment.serialNumber || "",
        status: equipment.status,
        lastMaintenance: equipment.lastMaintenance,
        nextMaintenance: equipment.nextMaintenance,
      });
    } else if (!equipment && open) {
      form.reset({
        companyId: 0,
        name: "",
        model: "",
        serialNumber: "",
        status: "active",
        lastMaintenance: null,
        nextMaintenance: null,
      });
    }
  }, [equipment, open, form]);

  const onSubmit = (data: InsertEquipment) => {
    if (equipment) {
      updateEquipment.mutate({ id: equipment.id, data }, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    } else {
      createEquipment.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!externalOpen && (
        <DialogTrigger asChild>
          <Button className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Novo Equipamento
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{equipment ? "Editar Equipamento" : "Cadastrar Novo Equipamento"}</DialogTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Impressora Laser" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: HP LaserJet Pro" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Série</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SN12345678" {...field} value={field.value || ''} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createEquipment.isPending || updateEquipment.isPending}>
                {createEquipment.isPending || updateEquipment.isPending ? "Salvando..." : equipment ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

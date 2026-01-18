import { useQuery, useMutation } from "@tanstack/react-query";
import { Equipment, InsertEquipment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useEquipment(companyId?: number) {
  return useQuery< (Equipment & { company: { name: string } })[] >({
    queryKey: companyId ? ["/api/equipment", { companyId }] : ["/api/equipment"],
  });
}

export function useCreateEquipment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (item: InsertEquipment) => {
      const res = await apiRequest("POST", "/api/equipment", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Sucesso",
        description: "Equipamento cadastrado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEquipment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEquipment> }) => {
      const res = await apiRequest("PATCH", `/api/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Sucesso",
        description: "Equipamento atualizado com sucesso",
      });
    },
  });
}

export function useDeleteEquipment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Sucesso",
        description: "Equipamento removido com sucesso",
      });
    },
  });
}

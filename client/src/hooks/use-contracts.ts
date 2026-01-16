import { useQuery, useMutation } from "@tanstack/react-query";
import { Contract, InsertContract } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useContracts(companyId?: number) {
  return useQuery< (Contract & { company: { name: string } })[] >({
    queryKey: companyId ? ["/api/contracts", { companyId }] : ["/api/contracts"],
  });
}

export function useCreateContract() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (contract: InsertContract) => {
      const res = await apiRequest("POST", "/api/contracts", contract);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso",
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

export function useDeleteContract() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Sucesso",
        description: "Contrato removido com sucesso",
      });
    },
  });
}

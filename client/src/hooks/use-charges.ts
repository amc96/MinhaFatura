import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertCharge } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCharges(companyId?: number) {
  return useQuery({
    queryKey: [api.charges.list.path, companyId],
    queryFn: async () => {
      // Build URL with query params if companyId exists
      const url = new URL(api.charges.list.path, window.location.origin);
      if (companyId) {
        url.searchParams.append("companyId", companyId.toString());
      }

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch charges");
      return api.charges.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCharge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCharge) => {
      const res = await fetch(api.charges.create.path, {
        method: api.charges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create charge");
      }
      return api.charges.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.charges.list.path] });
      toast({
        title: "Success",
        description: "Charge created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUploadFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.charges.upload.path, {
        method: api.charges.upload.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
      return api.charges.upload.responses[200].parse(await res.json());
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

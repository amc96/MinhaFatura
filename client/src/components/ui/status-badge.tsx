import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  
  let label = status;
  if (status === "paid") {
    variant = "default";
    label = "Pago";
  } else if (status === "overdue") {
    variant = "destructive";
    label = "Atrasado";
  } else if (status === "pending") {
    variant = "secondary";
    label = "Pendente";
  }

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}

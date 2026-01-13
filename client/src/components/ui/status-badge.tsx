import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  
  if (status === "paid") variant = "default";
  else if (status === "overdue") variant = "destructive";
  else if (status === "pending") variant = "secondary";

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

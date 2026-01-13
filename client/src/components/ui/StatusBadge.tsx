import { cn } from "@/lib/utils";

type Status = "pending" | "paid" | "overdue";

const styles = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

const labels = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status as Status;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[normalizedStatus] || styles.pending
      )}
    >
      {labels[normalizedStatus] || status}
    </span>
  );
}

import { useEquipment, useDeleteEquipment } from "@/hooks/use-equipment";
import { EquipmentForm } from "@/components/forms/EquipmentForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Settings, Trash2, Building, Pencil } from "lucide-react";
import { useState } from "react";
import { Equipment } from "@shared/schema";

export default function EquipmentPage() {
  const { data: equipment, isLoading } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipamentos</h1>
          <p className="text-slate-500 mt-2">Gerencie os equipamentos alocados nas empresas.</p>
        </div>
        <EquipmentForm 
          equipment={editingEquipment} 
          open={formOpen} 
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingEquipment(undefined);
          }} 
        />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Modelo / S/N</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment?.map((item) => (
                  <TableRow key={item.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{item.company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{item.model || '-'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.serialNumber || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-500 hover:text-primary"
                          onClick={() => {
                            setEditingEquipment(item);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este equipamento?")) {
                              deleteEquipment.mutate(item.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {equipment?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum equipamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

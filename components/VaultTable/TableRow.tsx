import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2 } from "lucide-react";
import { VaultData } from "@/app/admin/Vault/VaultData";

interface VaultTableRowProps {
  data: VaultData;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export const VaultTableRow = ({ data, onEdit, onDelete }: VaultTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="px-4 py-3 border-b border-gray-500 text-sm">
        {data.key}
      </TableCell>
      <TableCell className="px-4 py-3 border-b border-gray-500 text-sm">
        {data.createdBy}
      </TableCell>
      <TableCell className="px-4 py-3 border-b border-gray-500 text-sm">
        {data.lastUpdatedOn}
      </TableCell>
      <TableCell className="px-4 py-3 border-b border-gray-500 text-sm">
        <div className="flex justify-start space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(data.key)}>
            <SquarePen className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(data.key)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

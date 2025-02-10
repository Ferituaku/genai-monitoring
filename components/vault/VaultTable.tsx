import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2 } from "lucide-react";
import { VaultData } from "@/types/vault";

interface VaultTableProps {
  data: VaultData[];
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
  isLoading?: boolean;
}

export const VaultTable = ({
  data,
  onEdit,
  onDelete,
  isLoading,
}: VaultTableProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vault Name</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.key}>
            <TableCell className="font-medium">{/* {item.name} */}</TableCell>
            <TableCell className="font-medium">{item.value}</TableCell>
            <TableCell>{item.createdBy}</TableCell>
            <TableCell>
              {new Date(item.lastUpdatedOn).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(item.key)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(item.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

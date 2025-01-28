import { TableBody, Table } from "@/components/ui/table";
import { VaultTableHeader } from "./TableHeader";
import { VaultTableRow } from "./TableRow";
import { VaultData } from "@/app/admin/Vault/VaultData";

interface VaultTableProps {
  data: VaultData[];
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export const VaultTable = ({ data, onEdit, onDelete }: VaultTableProps) => {
  return (
    <Table className="w-full rounded-lg">
      <VaultTableHeader />
      <TableBody>
        {data.map((item) => (
          <VaultTableRow
            key={item.key}
            data={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

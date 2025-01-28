import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const VaultTableHeader = () => {
  const headers = ["Key", "Created By", "Last Updated On", "Actions"];

  return (
    <TableHeader>
      <TableRow className="sticky top-2 border-b border-gray-500">
        {headers.map((header) => (
          <TableHead
            key={header}
            className="px-4 py-3 text-left border-b border-gray-500 text-sm font-medium text-gray-500"
          >
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

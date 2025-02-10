import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectorProps {
  pageSize: string;
  setPageSize: (value: string) => void;
}

export const PageSizeSelector = ({
  pageSize,
  setPageSize,
}: PageSizeSelectorProps) => {
  return (
    <Select value={pageSize} onValueChange={setPageSize}>
      <SelectTrigger className="w-32 bg-blue-600 hover:bg-blue-700 text-white border-0">
        <span className="flex items-center gap-2">
          Ukuran: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
      </SelectContent>
    </Select>
  );
};

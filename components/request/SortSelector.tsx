import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortDirection, SortField } from "@/types/trace";

interface SortSelectorProps {
  sortField: string;
  sortDirection: SortDirection;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
}

export const SortSelector = ({
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
}: SortSelectorProps) => {
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };
  return (
    <Select
      value={`${sortField}-${sortDirection}`}
      onValueChange={handleSortChange}
    >
      <SelectTrigger className="w-20 bg-blue-600 hover:bg-blue-700 text-white border-0">
        <span className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Timestamp-desc">Newest First</SelectItem>
        <SelectItem value="Timestamp-asc">Oldest First</SelectItem>
        <SelectItem value="SpanAttributes.gen_ai.request.model-asc">
          Model (A-Z)
        </SelectItem>
        <SelectItem value="SpanAttributes.gen_ai.usage.total_tokens-desc">
          Highest Tokens
        </SelectItem>
        <SelectItem value="SpanAttributes.gen_ai.usage.cost-desc">
          Highest Cost
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

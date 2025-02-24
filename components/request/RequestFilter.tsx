// components/Request/FilterPanel.tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TokenRange } from "@/types/requests";

interface FilterPanelProps {
  modelSearchTerm: string;
  setModelSearchTerm: (term: string) => void;
  environmentSearchTerm: string;
  setEnvironmentSearchTerm: (term: string) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (environments: string[]) => void;
  filteredUniqueModels: string[];
  filteredUniqueEnvironments: string[];
  tokenRange: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  };
  setTokenRange: (range: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  }) => void;
  duration: { min: number; max: number };
  setDuration: (duration: { min: number; max: number }) => void;
  isStream: boolean;
  setIsStream: (isStream: boolean) => void;
  resetFilters: () => void;
}

export const Filtering = ({
  modelSearchTerm,
  setModelSearchTerm,
  environmentSearchTerm,
  setEnvironmentSearchTerm,
  selectedModels,
  setSelectedModels,
  selectedEnvironments,
  setSelectedEnvironments,
  filteredUniqueModels,
  filteredUniqueEnvironments,
}: FilterPanelProps) => {
  const FilterSection = ({
    title,
    searchTerm,
    setSearchTerm,
    items,
    selectedItems,
    setSelectedItems,
  }: {
    title: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    items: string[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={`Search ${title.toLowerCase()}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="max-h-40 overflow-y-auto space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={item}
              checked={selectedItems.includes(item)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedItems([...selectedItems, item]);
                } else {
                  setSelectedItems(selectedItems.filter((i) => i !== item));
                }
              }}
            />
            <Label htmlFor={item}>{item}</Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <FilterSection
        title="Models"
        searchTerm={modelSearchTerm}
        setSearchTerm={setModelSearchTerm}
        items={filteredUniqueModels}
        selectedItems={selectedModels}
        setSelectedItems={setSelectedModels}
      />
      <FilterSection
        title="Environments"
        searchTerm={environmentSearchTerm}
        setSearchTerm={setEnvironmentSearchTerm}
        items={filteredUniqueEnvironments}
        selectedItems={selectedEnvironments}
        setSelectedItems={setSelectedEnvironments}
      />
    </div>
  );
};

// src/components/request/FilterButton/FilterButton.tsx
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterButtonProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
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
  resetFilters: () => void;
}

export const FilterButton = ({
  isFilterOpen,
  setIsFilterOpen,
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
  resetFilters,
}: FilterButtonProps) => {
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
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder={`Search ${title.toLowerCase()}`}
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-40 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`${title}-${item}`}
                checked={selectedItems.includes(item)}
                onCheckedChange={(checked) => {
                  setSelectedItems(
                    checked
                      ? [...selectedItems, item]
                      : selectedItems.filter((i) => i !== item)
                  );
                }}
              />
              <Label htmlFor={`${title}-${item}`}>{item}</Label>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No {title.toLowerCase()} found
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="secondary"
          className="border-gray-700 shadow-md bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4 text-white" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
        <div className="space-y-4">
          <FilterSection
            title="Filter by Model"
            searchTerm={modelSearchTerm}
            setSearchTerm={setModelSearchTerm}
            items={filteredUniqueModels}
            selectedItems={selectedModels}
            setSelectedItems={setSelectedModels}
          />

          <FilterSection
            title="Filter by Environment"
            searchTerm={environmentSearchTerm}
            setSearchTerm={setEnvironmentSearchTerm}
            items={filteredUniqueEnvironments}
            selectedItems={selectedEnvironments}
            setSelectedItems={setSelectedEnvironments}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

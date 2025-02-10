import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  modelSearchTerm: string;
  setModelSearchTerm: (value: string) => void;
  environmentSearchTerm: string;
  setEnvironmentSearchTerm: (value: string) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (environments: string[]) => void;
  filteredUniqueModels: string[];
  filteredUniqueEnvironments: string[];
  resetFilters: () => void;
}

export const FilterPanel = ({
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
}: FilterPanelProps) => {
  const handleModelFilter = (model: string, checked: boolean) => {
    setSelectedModels(
      checked
        ? [...selectedModels, model]
        : selectedModels.filter((m) => m !== model)
    );
  };

  const handleEnvironmentFilter = (env: string, checked: boolean) => {
    setSelectedEnvironments(
      checked
        ? [...selectedEnvironments, env]
        : selectedEnvironments.filter((e) => e !== env)
    );
  };
  return (
    <div className="space-y-4">
      {/* Model Filter Section */}
      <div>
        <h4 className="font-medium mb-2">Filter by Model</h4>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search models"
            className="pl-8 w-full"
            value={modelSearchTerm}
            onChange={(e) => setModelSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-40 overflow-y-auto">
          {filteredUniqueModels
            .filter((model) =>
              model?.toLowerCase().includes(modelSearchTerm.toLowerCase())
            )
            .map((model) => (
              <div key={model} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`model-${model}`}
                  checked={selectedModels.includes(model)}
                  onCheckedChange={(checked) =>
                    handleModelFilter(model, checked as boolean)
                  }
                />
                <Label htmlFor={`model-${model}`}>{model}</Label>
              </div>
            ))}
        </div>
      </div>

      {/* Environment Filter Section */}
      <div>
        <h4 className="font-medium mb-2">Filter by Environment</h4>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search environments"
            className="pl-8 w-full"
            value={environmentSearchTerm}
            onChange={(e) => setEnvironmentSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-40 overflow-y-auto">
          {filteredUniqueEnvironments
            .filter((env) =>
              env?.toLowerCase().includes(environmentSearchTerm.toLowerCase())
            )
            .map((env) => (
              <div key={env} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`env-${env}`}
                  checked={selectedEnvironments.includes(env)}
                  onCheckedChange={(checked) =>
                    handleEnvironmentFilter(env, checked as boolean)
                  }
                />
                <Label htmlFor={`env-${env}`}>{env}</Label>
              </div>
            ))}
        </div>
      </div>

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
  );
};

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { TokenRange } from "@/types/requests";

interface FilterPanelProps {
  selectedModels: string[];
  setSelectedModels: (value: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (value: string[]) => void;
  modelSearchTerm: string;
  setModelSearchTerm: (value: string) => void;
  environmentSearchTerm: string;
  setEnvironmentSearchTerm: (value: string) => void;
  onApply: () => void;
  resetFilters: () => void;
  filteredUniqueModels: string[];
  filteredUniqueEnvironments: string[];
}

export const FilterPanel = ({
  selectedModels,
  setSelectedModels,
  selectedEnvironments,
  setSelectedEnvironments,
  modelSearchTerm,
  setModelSearchTerm,
  environmentSearchTerm,
  setEnvironmentSearchTerm,
  onApply,
  resetFilters,
  filteredUniqueModels,
  filteredUniqueEnvironments,
}: FilterPanelProps) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <Label>Models</Label>
        <Input
          placeholder="Search models..."
          value={modelSearchTerm}
          onChange={(e) => setModelSearchTerm(e.target.value)}
          className="mb-2"
        />
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredUniqueModels.map((model) => (
            <div key={model} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedModels.includes(model)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedModels([...selectedModels, model]);
                  } else {
                    setSelectedModels(
                      selectedModels.filter((m) => m !== model)
                    );
                  }
                }}
              />
              <Label className="text-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" title={model}>
                {model}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Environments</Label>
        <Input
          placeholder="Search environments..."
          value={environmentSearchTerm}
          onChange={(e) => setEnvironmentSearchTerm(e.target.value)}
          className="mb-2"
        />
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredUniqueEnvironments.map((env) => (
            <div key={env} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedEnvironments.includes(env)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEnvironments([...selectedEnvironments, env]);
                  } else {
                    setSelectedEnvironments(
                      selectedEnvironments.filter((e) => e !== env)
                    );
                  }
                }}
              />
              <Label className="text-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" title={env}>
                {env}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={resetFilters} className="flex-1">
          Reset
        </Button>
        <Button
          onClick={() => {
            onApply();
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "../ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Filtering } from "./RequestFilter";
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
  tokenRange: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  };
  setTokenRange: (value: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  }) => void;
  duration: { min: number; max: number };
  setDuration: (value: { min: number; max: number }) => void;
  isStream: boolean;
  setIsStream: (value: boolean) => void;
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
  tokenRange,
  setTokenRange,
  duration,
  setDuration,
  isStream,
  setIsStream,
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
              <Label>{model}</Label>
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
              <Label>{env}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Token Range</Label>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Input Tokens</Label>
            <Slider
              min={0}
              max={4000}
              step={100}
              value={[tokenRange.input.min, tokenRange.input.max]}
              onValueChange={([min, max]) =>
                setTokenRange({
                  ...tokenRange,
                  input: { min, max },
                })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm">Output Tokens</Label>
            <Slider
              min={0}
              max={4000}
              step={100}
              value={[tokenRange.output.min, tokenRange.output.max]}
              onValueChange={([min, max]) =>
                setTokenRange({
                  ...tokenRange,
                  output: { min, max },
                })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm">Total Tokens</Label>
            <Slider
              min={0}
              max={8000}
              step={100}
              value={[tokenRange.total.min, tokenRange.total.max]}
              onValueChange={([min, max]) =>
                setTokenRange({
                  ...tokenRange,
                  total: { min, max },
                })
              }
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Duration (ms)</Label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={[duration.min, duration.max]}
          onValueChange={([min, max]) => setDuration({ min, max })}
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isStream}
          onCheckedChange={(checked) => setIsStream(checked as boolean)}
        />
        <Label>Stream</Label>
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

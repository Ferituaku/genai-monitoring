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
  tokenRange: {
    input: { min?: number; max?: number };
    output: { min?: number; max?: number };
    total: { min?: number; max?: number };
  };
  setTokenRange: (range: any) => void;
  duration: { min?: number; max?: number };
  setDuration: (duration: any) => void;
  isStream: boolean;
  setIsStream: (value: boolean) => void;
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
  tokenRange,
  setTokenRange,
  duration,
  setDuration,
  isStream,
  setIsStream,
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
      <Accordion type="single" collapsible className="w-full">
        {/* Model Filter Section */}
        <AccordionItem value="models">
          <AccordionTrigger>Token Usage</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>

        {/* Environment Filter Section */}
        <AccordionItem value="models">
          <AccordionTrigger>Flter By Environment</AccordionTrigger>
          <AccordionContent>
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
                  env
                    ?.toLowerCase()
                    .includes(environmentSearchTerm.toLowerCase())
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
          </AccordionContent>
        </AccordionItem>
        {/* filter tokens range */}
        <AccordionItem value="tokens">
          <AccordionTrigger>Token Usage</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label>Input Tokens</Label>
                <Slider
                  min={0}
                  max={4000}
                  step={100}
                  value={[
                    tokenRange.input.min || 0,
                    tokenRange.input.max || 4000,
                  ]}
                  onValueChange={(value) =>
                    setTokenRange({
                      ...tokenRange,
                      input: { min: value[0], max: value[1] },
                    })
                  }
                />
              </div>

              <div>
                <Label>Output Tokens</Label>
                <Slider
                  min={0}
                  max={4000}
                  step={100}
                  value={[
                    tokenRange.output.min || 0,
                    tokenRange.output.max || 4000,
                  ]}
                  onValueChange={(value) =>
                    setTokenRange({
                      ...tokenRange,
                      output: { min: value[0], max: value[1] },
                    })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="duration">
          <AccordionTrigger>Duration</AccordionTrigger>
          <AccordionContent>
            <div>
              <Label>Request Duration (ms)</Label>
              <Slider
                min={0}
                max={10000}
                step={100}
                value={[duration.min || 0, duration.max || 10000]}
                onValueChange={(value) =>
                  setDuration({ min: value[0], max: value[1] })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="stream">
          <AccordionTrigger>Stream Options</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stream"
                checked={isStream}
                onCheckedChange={(checked) => setIsStream(checked as boolean)}
              />
              <Label htmlFor="stream">Stream Requests Only</Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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

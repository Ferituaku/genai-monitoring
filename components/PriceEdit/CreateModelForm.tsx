import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Models } from "@/lib/PriceEdit/api";

interface CreateModelFormProps {
  loading: boolean;
  models: Models;
  newModelName: string;
  newDetailName: string;
  newDetailPrice: string;
  onModelNameChange: (value: string) => void;
  onDetailNameChange: (value: string) => void;
  onDetailPriceChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const CreateModelForm: React.FC<CreateModelFormProps> = ({
  loading,
  models,
  newModelName,
  newDetailName,
  newDetailPrice,
  onModelNameChange,
  onDetailNameChange,
  onDetailPriceChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Model Name</label>
        <Select
          value={newModelName}
          onValueChange={onModelNameChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Model Name" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(models).map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Detail Name</label>
        <Input
          type="text"
          value={newDetailName}
          onChange={(e) => onDetailNameChange(e.target.value)}
          placeholder="Enter detail name"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price</label>
        <Input
          type="number"
          step="0.000001"
          value={newDetailPrice}
          onChange={(e) => onDetailPriceChange(e.target.value)}
          placeholder="Enter price"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!newModelName || !newDetailName || !newDetailPrice || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            "Create Model"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateModelForm;
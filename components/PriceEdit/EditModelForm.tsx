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

interface EditModelFormProps {
  loading: boolean;
  models: Models;
  modelName: string;
  selectedDetail: string;
  currentPrice: number | null;
  newPrice: string;
  onModelSelect: (value: string) => void;
  onDetailSelect: (value: string) => void;
  onNewPriceChange: (value: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

const EDIT_MODEL_FORM: React.FC<EditModelFormProps> = ({
  loading,
  models,
  modelName,
  selectedDetail,
  currentPrice,
  newPrice,
  onModelSelect,
  onDetailSelect,
  onNewPriceChange,
  onCancel,
  onDelete,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Model Name</label>
        <Select
          value={modelName}
          onValueChange={onModelSelect}
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

      {modelName && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Model Detail</label>
          <Select
            value={selectedDetail}
            onValueChange={onDetailSelect}
            disabled={loading || !modelName}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Detail to Edit" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(models[modelName] || {}).map((detail) => (
                <SelectItem key={detail} value={detail}>
                  {detail}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedDetail && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Price</label>
            <Input
              type="text"
              readOnly
              value={currentPrice?.toString() || ""}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Price</label>
            <Input
              type="number"
              step="0.000001"
              value={newPrice}
              onChange={(e) => onNewPriceChange(e.target.value)}
              placeholder="Enter new price"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              onClick={onUpdate}
              disabled={!modelName || !selectedDetail || !newPrice || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EDIT_MODEL_FORM;

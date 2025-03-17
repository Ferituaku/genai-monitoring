import React, { useState, useEffect } from "react";
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
  currentPrice: any;
  newPrice: any; 
  onModelSelect: (value: string) => void;
  onDetailSelect: (value: string) => void;
  onNewPriceChange: (value: any) => void;
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
  const isChatModel = modelName === "chat";
  const [promptPrice, setPromptPrice] = useState("");
  const [completionPrice, setCompletionPrice] = useState("");
  
  const disabledModels = ["images"];
  
  useEffect(() => {
    if (isChatModel && selectedDetail && currentPrice) {
      if (typeof currentPrice === 'object') {
        setPromptPrice(currentPrice.promptPrice?.toString() || "");
        setCompletionPrice(currentPrice.completionPrice?.toString() || "");
      }
    }
  }, [isChatModel, selectedDetail, currentPrice]);

  const handlePromptPriceChange = (value: string) => {
    setPromptPrice(value);
    onNewPriceChange({
      promptPrice: value,
      completionPrice: completionPrice || "0"
    });
  };

  const handleCompletionPriceChange = (value: string) => {
    setCompletionPrice(value);
    onNewPriceChange({
      promptPrice: promptPrice || "0",
      completionPrice: value
    });
  };

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
              <SelectItem 
                key={model} 
                value={model}
                disabled={disabledModels.includes(model)}
              >
                {disabledModels.includes(model) ? `${model} (coming soon)` : model}
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

      {selectedDetail && !isChatModel && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Price</label>
            <Input
              type="text"
              readOnly
              value={typeof currentPrice === 'number' ? currentPrice.toString() : ''}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Price</label>
            <Input
              type="number"
              step="0.000001"
              value={typeof newPrice === 'string' ? newPrice : ''}
              onChange={(e) => onNewPriceChange(e.target.value)}
              placeholder="Enter new price"
              disabled={loading}
            />
          </div>
        </>
      )}

      {selectedDetail && isChatModel && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Prompt Price</label>
            <Input
              type="text"
              readOnly
              value={currentPrice && typeof currentPrice === 'object' ? 
                (currentPrice.promptPrice?.toString() || '') : ''}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Completion Price</label>
            <Input
              type="text"
              readOnly
              value={currentPrice && typeof currentPrice === 'object' ? 
                (currentPrice.completionPrice?.toString() || '') : ''}
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Prompt Price</label>
            <Input
              type="number"
              step="0.000001"
              value={promptPrice}
              onChange={(e) => handlePromptPriceChange(e.target.value)}
              placeholder="Enter new prompt price"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Completion Price</label>
            <Input
              type="number"
              step="0.000001"
              value={completionPrice}
              onChange={(e) => handleCompletionPriceChange(e.target.value)}
              placeholder="Enter new completion price"
              disabled={loading}
            />
          </div>
        </>
      )}

      {selectedDetail && (
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
            disabled={
              !modelName || 
              !selectedDetail || 
              (isChatModel ? (!promptPrice || !completionPrice) : !newPrice) || 
              loading
            }
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
      )}
    </div>
  );
};

export default EDIT_MODEL_FORM;
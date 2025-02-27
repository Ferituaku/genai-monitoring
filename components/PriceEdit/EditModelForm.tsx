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
  currentPrice: any; // Menggunakan any untuk mendukung format chat dan non-chat
  newPrice: any; // Menggunakan any untuk mendukung format chat dan non-chat
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
  // chat model
  const isChatModel = modelName === "chat";
  const [promptPrice, setPromptPrice] = useState("");
  const [completionPrice, setCompletionPrice] = useState("");
  
  useEffect(() => {
    if (isChatModel && selectedDetail && currentPrice) {
      if (typeof currentPrice === 'object') {
        setPromptPrice(currentPrice.promptPrice?.toString() || "");
        setCompletionPrice(currentPrice.completionPrice?.toString() || "");
      }
    }
  }, [isChatModel, selectedDetail, currentPrice]);

  // Handler promptPrice
  const handlePromptPriceChange = (value: string) => {
    setPromptPrice(value);
    onNewPriceChange({
      promptPrice: parseFloat(value),
      completionPrice: parseFloat(completionPrice || "0")
    });
  };

  // Handler completionPrice
  const handleCompletionPriceChange = (value: string) => {
    setCompletionPrice(value);
    onNewPriceChange({
      promptPrice: parseFloat(promptPrice || "0"),
      completionPrice: parseFloat(value)
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

      {/* Audio & embedding model */}
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

      {/* Chat model */}
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
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

const CREATE_MODEL_FORM: React.FC<CreateModelFormProps> = ({
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
  const [promptPrice, setPromptPrice] = useState("");
  const [completionPrice, setCompletionPrice] = useState("");
  const isChatModel = newModelName === "chat";
  
  useEffect(() => {
    if (isChatModel) {
      setPromptPrice(newDetailPrice || "");
      setCompletionPrice(newDetailPrice || "");
    }
  }, [isChatModel, newDetailPrice]);
  
  useEffect(() => {
    if (isChatModel && promptPrice && completionPrice) {
      onDetailPriceChange(promptPrice);
    }
  }, [isChatModel, promptPrice, completionPrice, onDetailPriceChange]);

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
            <SelectItem value="chat">chat</SelectItem>
            <SelectItem value="audio">audio</SelectItem>
            <SelectItem value="embeddings">embeddings</SelectItem>
            <SelectItem value="images" disabled>images (coming soon)</SelectItem>
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

      {!isChatModel ? (
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
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Price</label>
            <Input
              type="number"
              step="0.000001"
              value={promptPrice}
              onChange={(e) => setPromptPrice(e.target.value)}
              placeholder="Enter prompt price"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Completion Price</label>
            <Input
              type="number"
              step="0.000001"
              value={completionPrice}
              onChange={(e) => setCompletionPrice(e.target.value)}
              placeholder="Enter completion price"
              disabled={loading}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            !newModelName || 
            !newDetailName || 
            (isChatModel ? (!promptPrice || !completionPrice) : !newDetailPrice) || 
            loading
          }
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

export default CREATE_MODEL_FORM;
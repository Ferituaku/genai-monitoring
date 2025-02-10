import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VaultFormData } from "@/types/vault";

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VaultFormData) => void;
}

export const AddKeyModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddKeyModalProps) => {
  const [formData, setFormData] = useState<VaultFormData>({
    key: "",
    value: "",
    createdBy: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ key: "", value: "", createdBy: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vault Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              placeholder="Enter key"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder="Enter value"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createdBy">Created By</Label>
            <Input
              id="createdBy"
              value={formData.createdBy}
              onChange={(e) =>
                setFormData({ ...formData, createdBy: e.target.value })
              }
              placeholder="Enter creator name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Key</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

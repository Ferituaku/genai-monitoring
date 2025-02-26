import { useState, useEffect } from "react";
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
    api_key: "",
    project: "",
    value: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setError("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ api_key: "", project: "", value: "" });
      setError("");
    } catch (err: any) {
      // Menggunakan error message dari API response
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError(err.message || "Terjadi kesalahan saat menambahkan vault key");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vault Key</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              value={formData.api_key}
              onChange={(e) =>
                setFormData({ ...formData, api_key: e.target.value })
              }
              placeholder="Enter API key"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value })
              }
              placeholder="Enter project name"
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Vault</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

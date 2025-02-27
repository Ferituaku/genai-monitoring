import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CLIENT } from "@/lib/ApiKeysService/api";

interface GenerateApiKeyDialogProps {
  onKeyCreated: () => void;
}

export function GenerateApiKeyDialog({
  onKeyCreated,
}: GenerateApiKeyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    try {
      const result = await API_CLIENT.generate_api_key(name, project);
      toast({
        title: "Success",
        description: `API key generated: ${result.api_key.substring(0, 20)}...`,
      });
      onKeyCreated();
      setIsOpen(false);
      setName("");
      setProject("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate API key";
      setError(errorMessage);
      
      if (!errorMessage.includes("sudah tersedia")) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setError(null);
    }}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter API key name"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9\s]+"
              title="Only letters, numbers and spaces allowed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Enter project name"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9\-_]+"
              title="Only letters, numbers, hyphens and underscores allowed"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate API Key"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
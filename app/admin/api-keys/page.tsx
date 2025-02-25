"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { API_CLIENT, ApiKey } from "@/lib/ApiKeysService/api";
import { useToast } from "@/hooks/use-toast";
import { GenerateApiKeyDialog } from "@/components/ApiKeys/generateApiKey";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApiKeysPage() {
  const [API_KEYS, SET_API_KEYS] = useState<ApiKey[]>([]);
  const [LOADING, SET_LOADING] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const FETCH_API_KEY = async () => {
    try {
      const keys = await API_CLIENT.get_all_api_keys();
      SET_API_KEYS(keys);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      SET_LOADING(false);
    }
  };

  useEffect(() => {
    FETCH_API_KEY();
  }, []);

  const HANDLE_COPY_APIKEY = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      variant: "default",
      title: "Berhasil Disalin",
      description: "API key telah disalin ke clipboard",
    });
  };

  const HANDLE_DELETE_CLICK = (apiKey: string) => {
    setKeyToDelete(apiKey);
    setIsDeleteDialogOpen(true);
  };

  const HANDLE_CONFIRM_DELETE = async () => {
    if (!keyToDelete) return;
    
    try {
      await API_CLIENT.delete_api_key(keyToDelete);
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
      FETCH_API_KEY();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete API key",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  if (LOADING) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys. Keep these secure and never share them
            publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {API_KEYS.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No API keys available
                  </TableCell>
                </TableRow>
              ) : (
                API_KEYS.map((key) => (
                  <TableRow key={key.api_key}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      {key.api_key.length > 10 
                        ? `${key.api_key.substring(0, 10)}*************${key.api_key.substring(key.api_key.length - 4)}`
                        : key.api_key}
                    </TableCell>
                    <TableCell>
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{key.project}</TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => HANDLE_COPY_APIKEY(key.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => HANDLE_DELETE_CLICK(key.api_key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GenerateApiKeyDialog onKeyCreated={FETCH_API_KEY} />

      {/* Alert Dialog untuk konfirmasi penghapusan */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={HANDLE_CONFIRM_DELETE} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
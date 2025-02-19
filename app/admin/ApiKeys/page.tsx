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

export default function ApiKeysPage() {
  const [API_KEYS, SET_API_KEYS] = useState<ApiKey[]>([]);
  const [LOADING, SET_LOADING] = useState(true);
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
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const HANDLE_DELETE = async (apiKey: string) => {
    try {
      await API_CLIENT.delete_api_key(apiKey);
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
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {API_KEYS.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No API keys available
                  </TableCell>
                </TableRow>
              ) : (
                API_KEYS.map((key) => (
                  <TableRow key={key.api_key}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{key.project}</TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => HANDLE_COPY_APIKEY(key.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => HANDLE_DELETE(key.api_key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
    </div>
  );
}

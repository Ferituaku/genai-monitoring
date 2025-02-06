'use client'

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Trash2 } from "lucide-react";
import DynamicBreadcrumb from "@/components/Breadcrum";

interface ApiKey {
  name: string;
  created_at: string;
  project: string;  // Pastikan 'project' adalah string, bukan array
}

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all API keys when the component mounts
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_all_api_keys");
        if (!response.ok) {
          throw new Error("Failed to fetch API keys");
        }
        const data = await response.json();

        // Pastikan data yang diterima adalah array yang valid
        if (Array.isArray(data)) {
          setApiKeys(data);
        } else {
          console.error("Data tidak valid:", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  // Function to handle generating a new API key
  const handleGenerateApiKey = async () => {
    const name = "New API Key";
    const project = "Project1, Project2";  // Ini string, bukan array

    const response = await fetch("http://127.0.0.1:5000/generate_api_key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        project: project,  // Kirim project sebagai string
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setApiKeys((prevKeys) => [
        ...prevKeys,
        { name: data.name, created_at: new Date().toISOString(), project },
      ]);
    } else {
      console.error("Failed to generate new API key");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">API Keys</CardTitle>
          <CardDescription>
            These keys can be used to read and write data. Please do not share
            these keys and make sure you store them somewhere secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Pastikan apiKeys adalah array yang valid */}
              {Array.isArray(apiKeys) && apiKeys.length > 0 ? (
                apiKeys.map((key, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>{new Date(key.created_at).toLocaleString()}</TableCell>
                    <TableCell>{key.project}</TableCell> {/* Tampilkan project sebagai string */}
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No API keys available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button onClick={handleGenerateApiKey} className="w-fit text-lg text-slate-200">
        Generate New Key
      </Button>
    </div>
  );
};

export default ApiKeys;

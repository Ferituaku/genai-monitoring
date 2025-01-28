import React from "react";
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

interface ApiKey {
  name: string;
  created: string;
  permissions: string;
}

const ApiKeys = () => {
  const apiKeys: ApiKey[] = [
    {
      name: "Main",
      created: "1/13/2025, 2:21:56 PM",
      permissions: "Read/Write",
    },
    {
      name: "Main",
      created: "1/13/2025, 2:22:05 PM",
      permissions: "Read/Write",
    },
    {
      name: "Main",
      created: "1/13/2025, 2:23:03 PM",
      permissions: "Read/Write",
    },
    {
      name: "coba1",
      created: "1/13/2025, 4:14:24 PM",
      permissions: "Read/Write",
    },
  ];

  return (
    <div className="flex ml-60 flex-col space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">API Keys</CardTitle>
          <CardDescription>
            These keys can be used to read and write data to Helicone. Please do
            not share these keys and make sure you store them somewhere secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{key.created}</TableCell>
                  <TableCell>{key.permissions}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button className="w-fit text-lg text-slate-200">Generate New Key</Button>
    </div>
  );
};

export default ApiKeys;

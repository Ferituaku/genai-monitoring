"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ModelPriceEdit = () => {
  const [modelName, setModelName] = useState("astra-openai-3.5");
  const [currentPrice, setCurrentPrice] = useState(0.000321);
  const [newPrice, setNewPrice] = useState(0.000821);

  return (
    <div className="max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6 text-start">Model Price Edit</h1>
      <Card>
        <CardHeader>Edit Model Price</CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="modelName">Model Name</Label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Model Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">gpt-3.5-turbo</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currentPrice">Current Price</Label>
            <Input
              id="currentPrice"
              value={currentPrice}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <Label htmlFor="newPrice">New Price</Label>
            <Input
              id="newPrice"
              value={newPrice}
              //   onChange={}
              placeholder="Enter new price"
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            //   onClick={}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            // onClick={}
            disabled={!newPrice}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ModelPriceEdit;

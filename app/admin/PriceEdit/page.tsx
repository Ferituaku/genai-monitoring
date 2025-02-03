"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModelData {
  [key: string]: number;
}

interface Models {
  [key: string]: ModelData;
}

const API_BASE_URL = "http://localhost:5000/data";

const ModelPriceManager = () => {
  const [modelName, setModelName] = useState("");
  const [models, setModels] = useState<Models>({});
  const [selectedDetail, setSelectedDetail] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [newModelName, setNewModelName] = useState("");
  const [newDetailName, setNewDetailName] = useState("");
  const [newDetailPrice, setNewDetailPrice] = useState("");

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setModels(data);
    } catch (error) {
      setError("Failed to fetch models data");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (value: string) => {
    setModelName(value);
    setSelectedDetail("");
    setCurrentPrice(null);
    setNewPrice("");
  };

  const handleDetailSelect = (value: string) => {
    setSelectedDetail(value);
    if (models[modelName]?.[value] !== undefined) {
      setCurrentPrice(models[modelName][value]);
    }
  };

  const handleUpdatePrice = async () => {
    if (!modelName || !selectedDetail || !newPrice) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/${modelName}/${selectedDetail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: parseFloat(newPrice) }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchModels();
      setCurrentPrice(parseFloat(newPrice));
      setNewPrice("");
      setError(null);
      setMode("view");
    } catch (error) {
      setError("Failed to update price");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!newModelName || !newDetailName || !newDetailPrice) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${newModelName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [newDetailName]: parseFloat(newDetailPrice),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchModels();
      setNewModelName("");
      setNewDetailName("");
      setNewDetailPrice("");
      setError(null);
      setMode("view");
    } catch (error) {
      setError("Failed to create model");
      console.error("Create error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!modelName || !selectedDetail) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/${modelName}/${selectedDetail}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchModels();
      setSelectedDetail("");
      setCurrentPrice(null);
      setError(null);
    } catch (error) {
      setError("Failed to delete detail");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModelName("");
    setSelectedDetail("");
    setNewPrice("");
    setNewModelName("");
    setNewDetailName("");
    setNewDetailPrice("");
    setError(null);
    setMode("view");
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Price Manager</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setMode(value as "view" | "edit" | "create")
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="view">View/Edit</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Name</label>

                  <Select
                    value={newModelName}
                    onValueChange={setNewModelName}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Detail Name</label>
                  <Input
                    type="text"
                    value={newDetailName}
                    onChange={(e) => setNewDetailName(e.target.value)}
                    placeholder="Enter detail name"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={newDetailPrice}
                    onChange={(e) => setNewDetailPrice(e.target.value)}
                    placeholder="Enter price"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateModel}
                    disabled={
                      !newModelName ||
                      !newDetailName ||
                      !newDetailPrice ||
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
            </TabsContent>

            <TabsContent value="view">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Name</label>
                  <Select
                    value={modelName}
                    onValueChange={handleModelSelect}
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
                      onValueChange={handleDetailSelect}
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

                {selectedDetail && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Current Price
                      </label>
                      <Input
                        type="text"
                        readOnly
                        value={currentPrice?.toString() || ""}
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Price</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Enter new price"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteDetail}
                        disabled={loading}
                      >
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
                        onClick={handleUpdatePrice}
                        disabled={
                          !modelName || !selectedDetail || !newPrice || loading
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
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelPriceManager;

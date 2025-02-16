"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { PriceEditApiService, Models } from "@/lib/PriceEdit/api";
import CreateModelForm from "@/components/PriceEdit/CreateModelForm";
import EditModelForm from "@/components/PriceEdit/EditModelForm";

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
      const data = await PriceEditApiService.getModels();
      setModels(data);
      setError(null);
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
      await PriceEditApiService.updatePrice(
        modelName,
        selectedDetail,
        parseFloat(newPrice)
      );
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
      await PriceEditApiService.createModel(
        newModelName,
        newDetailName,
        parseFloat(newDetailPrice)
      );
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
      await PriceEditApiService.deleteDetail(modelName, selectedDetail);
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
    <div className="min-h-screen">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
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
                <CreateModelForm
                  loading={loading}
                  models={models}
                  newModelName={newModelName}
                  newDetailName={newDetailName}
                  newDetailPrice={newDetailPrice}
                  onModelNameChange={setNewModelName}
                  onDetailNameChange={setNewDetailName}
                  onDetailPriceChange={setNewDetailPrice}
                  onCancel={handleCancel}
                  onSubmit={handleCreateModel}
                />
              </TabsContent>

              <TabsContent value="view">
                <EditModelForm
                  loading={loading}
                  models={models}
                  modelName={modelName}
                  selectedDetail={selectedDetail}
                  currentPrice={currentPrice}
                  newPrice={newPrice}
                  onModelSelect={handleModelSelect}
                  onDetailSelect={handleDetailSelect}
                  onNewPriceChange={setNewPrice}
                  onCancel={handleCancel}
                  onDelete={handleDeleteDetail}
                  onUpdate={handleUpdatePrice}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelPriceManager;
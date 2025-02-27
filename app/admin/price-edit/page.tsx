"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { PriceEditApiService, Models, ChatModelData } from "@/lib/PriceEdit/api";
import CREATE_MODEL_FORM from "@/components/PriceEdit/CreateModelForm";
import EDIT_MODEL_FORM from "@/components/PriceEdit/EditModelForm";

type CurrentPriceType = number | ChatModelData | null;
type NewPriceType = string | { promptPrice: string; completionPrice: string };

const ModelPriceManager = () => {
  const [modelName, setModelName] = useState("");
  const [models, setModels] = useState<Models>({});
  const [selectedDetail, setSelectedDetail] = useState("");
  const [currentPrice, setCurrentPrice] = useState<CurrentPriceType>(null);
  const [newPrice, setNewPrice] = useState<NewPriceType>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [newModelName, setNewModelName] = useState("");
  const [newDetailName, setNewDetailName] = useState("");
  const [newDetailPrice, setNewDetailPrice] = useState("");

  useEffect(() => {
    FETCH_MODEL();
  }, []);

  const FETCH_MODEL = async () => {
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

  const HANDLE_MODEL_SELECT = (value: string) => {
    setModelName(value);
    setSelectedDetail("");
    setCurrentPrice(null);
    setNewPrice(value === "chat" ? { promptPrice: "", completionPrice: "" } : "");
  };

  const HANDLE_DETAIL_SELECT = (value: string) => {
    setSelectedDetail(value);
    if (models[modelName]?.[value] !== undefined) {
      const priceData = models[modelName][value];
      
      // Set current price by model
      if (modelName === "chat" && typeof priceData === 'object') {
        setCurrentPrice(priceData as ChatModelData);
        setNewPrice({
          promptPrice: priceData.promptPrice.toString(),
          completionPrice: priceData.completionPrice.toString()
        });
      } else if (typeof priceData === 'number') {
        setCurrentPrice(priceData);
        setNewPrice(priceData.toString());
      }
    }
  };

  const HANDLE_UPDATE_PRICE = async () => {
    if (!modelName || !selectedDetail || !newPrice) return;

    setLoading(true);
    try {
      // Update price by model
      if (modelName === "chat" && typeof newPrice === 'object') {
        const chatData: ChatModelData = {
          promptPrice: parseFloat(newPrice.promptPrice),
          completionPrice: parseFloat(newPrice.completionPrice)
        };
        
        await PriceEditApiService.updatePrice(
          modelName,
          selectedDetail,
          chatData
        );
        
        // Update current price when success
        setCurrentPrice(chatData);
      } else if (typeof newPrice === 'string') {
        const numericPrice = parseFloat(newPrice);
        
        await PriceEditApiService.updatePrice(
          modelName,
          selectedDetail,
          numericPrice
        );
        
        setCurrentPrice(numericPrice);
      }
      
      await FETCH_MODEL();
      // Reset new price
      setNewPrice(modelName === "chat" ? { promptPrice: "", completionPrice: "" } : "");
      setError(null);
      setMode("view");
    } catch (error) {
      setError("Failed to update price");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const HANDLE_CRATE_MODEL = async () => {
    if (!newModelName || !newDetailName || !newDetailPrice) return;

    setLoading(true);
    try {
      if (newModelName === "chat") {
        const chatData: ChatModelData = {
          promptPrice: parseFloat(newDetailPrice),
          completionPrice: parseFloat(newDetailPrice)
        };
        
        await PriceEditApiService.createModel(
          newModelName,
          newDetailName,
          chatData
        );
      } else {
        await PriceEditApiService.createModel(
          newModelName,
          newDetailName,
          parseFloat(newDetailPrice)
        );
      }
      
      await FETCH_MODEL();
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

  const HANDLE_DELETE_DETAIL = async () => {
    if (!modelName || !selectedDetail) return;

    setLoading(true);
    try {
      await PriceEditApiService.deleteDetail(modelName, selectedDetail);
      await FETCH_MODEL();
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

  const HANDLE_CANCEL = () => {
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
                <CREATE_MODEL_FORM
                  loading={loading}
                  models={models}
                  newModelName={newModelName}
                  newDetailName={newDetailName}
                  newDetailPrice={newDetailPrice}
                  onModelNameChange={setNewModelName}
                  onDetailNameChange={setNewDetailName}
                  onDetailPriceChange={setNewDetailPrice}
                  onCancel={HANDLE_CANCEL}
                  onSubmit={HANDLE_CRATE_MODEL}
                />
              </TabsContent>

              <TabsContent value="view">
                <EDIT_MODEL_FORM
                  loading={loading}
                  models={models}
                  modelName={modelName}
                  selectedDetail={selectedDetail}
                  currentPrice={currentPrice}
                  newPrice={newPrice}
                  onModelSelect={HANDLE_MODEL_SELECT}
                  onDetailSelect={HANDLE_DETAIL_SELECT}
                  onNewPriceChange={setNewPrice}
                  onCancel={HANDLE_CANCEL}
                  onDelete={HANDLE_DELETE_DETAIL}
                  onUpdate={HANDLE_UPDATE_PRICE}
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
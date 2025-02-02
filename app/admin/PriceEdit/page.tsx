"use client";

import React, { useState, useEffect } from "react";

interface ModelData {
  [key: string]: number;
}

interface Models {
  [key: string]: ModelData;
}

const API_BASE_URL = 'http://localhost:5000/data';

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
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setModelName(value);
    setSelectedDetail("");
    setCurrentPrice(null);
    setNewPrice("");
  };

  const handleDetailSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedDetail(value);
    if (models[modelName]?.[value] !== undefined) {
      setCurrentPrice(models[modelName][value]);
    }
  };

  const handleUpdatePrice = async () => {
    if (!modelName || !selectedDetail || !newPrice) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${modelName}/${selectedDetail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: parseFloat(newPrice) }),
      });

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
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!newModelName || !newDetailName || !newDetailPrice) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${newModelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [newDetailName]: parseFloat(newDetailPrice)
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
      console.error('Create error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!modelName || !selectedDetail) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${modelName}/${selectedDetail}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchModels();
      setSelectedDetail("");
      setCurrentPrice(null);
      setError(null);
    } catch (error) {
      setError("Failed to delete detail");
      console.error('Delete error:', error);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Model Price Manager</h1>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Manage Model Prices</h2>
          <div className="space-x-2">
            <button
              onClick={() => setMode("view")}
              className={`px-4 py-2 rounded ${mode === "view" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}
            >
              View/Edit
            </button>
            <button
              onClick={() => setMode("create")}
              className={`px-4 py-2 rounded ${mode === "create" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}
            >
              Create New
            </button>
          </div>
        </div>

        {mode === "create" ? (
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-1">Model Name</div>
              <select
                className="w-full p-2 border rounded"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Model Name</option>
                {Object.keys(models).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="font-medium mb-1">Detail Name</div>
              <input
                type="text"
                value={newDetailName}
                onChange={(e) => setNewDetailName(e.target.value)}
                placeholder="Enter detail name"
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>

            <div>
              <div className="font-medium mb-1">Price</div>
              <input
                type="number"
                step="0.000001"
                value={newDetailPrice}
                onChange={(e) => setNewDetailPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModel}
                disabled={!newModelName || !newDetailName || !newDetailPrice || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Create Model"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-1">Model Name</div>
              <select
                className="w-full p-2 border rounded"
                value={modelName}
                onChange={handleModelSelect}
                disabled={loading}
              >
                <option value="">Select Model Name</option>
                {Object.keys(models).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {modelName && (
              <div>
                <div className="font-medium mb-1">Model Detail</div>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedDetail}
                  onChange={handleDetailSelect}
                  disabled={loading || !modelName}
                >
                  <option value="">Select Detail to Edit</option>
                  {Object.keys(models[modelName] || {}).map((detail) => (
                    <option key={detail} value={detail}>
                      {detail}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedDetail && (
              <>
                <div>
                  <div className="font-medium mb-1">Current Price</div>
                  <input
                    type="text"
                    readOnly
                    value={currentPrice?.toString() || ''}
                    className="w-full p-2 border rounded bg-gray-50"
                  />
                </div>

                <div>
                  <div className="font-medium mb-1">New Price</div>
                  <input
                    type="number"
                    step="0.000001"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Enter new price"
                    className="w-full p-2 border rounded"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDetail}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Delete"}
                  </button>
                  <button
                    onClick={handleUpdatePrice}
                    disabled={!modelName || !selectedDetail || !newPrice || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelPriceManager;
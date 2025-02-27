// lib/PriceEdit/api.ts

export interface ChatModelData {
  promptPrice: number;
  completionPrice: number;
}

export interface ModelData {
  [key: string]: number | ChatModelData;
}

export interface Models {
  [key: string]: ModelData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class PriceEditApiService {
  static async getModels(): Promise<Models> {
    try {
      const url = `${API_BASE_URL}/data`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  static async updatePrice(
    modelName: string,
    detailName: string,
    price: number | ChatModelData
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/data/${modelName}/${detailName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: price }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating price:", error);
      throw error;
    }
  }

  static async createModel(
    modelName: string,
    detailName: string,
    price: number | ChatModelData
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/${modelName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [detailName]: price,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  }

  static async deleteDetail(
    modelName: string,
    detailName: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/data/${modelName}/${detailName}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting detail:", error);
      throw error;
    }
  }
}
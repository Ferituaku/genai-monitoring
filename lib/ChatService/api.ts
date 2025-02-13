// services/api.ts

import { TimeFrameParams } from "@/types/timeframe";
import { createTimeFrameQueryString } from "../TimeFrame/api";

interface ChatSession {
  UniqueIDChat: string;
  Timestamp: string;
  TotalMessages: number;
}

interface ProjectChat {
  serviceName: string;
  environment: string;
  totalRequests: number;
  chatSessions: ChatSession[];
}

export interface ChatMessage {
  Timestamp: string;
  ChatID: string;
  Pertanyaan: string;
  Jawaban: string;
}

export interface ChatHistoryData {
  UniqueIDChat: string;
  ServiceName: string;
  Environment: string;
  TotalMessages: number;
  ChatHistory: ChatMessage[];
}

export class ApiService {
  static async getProjectChats(
    timeParams: TimeFrameParams
  ): Promise<ProjectChat[]> {
    try {
      const queryString = createTimeFrameQueryString(timeParams);
      const response = await fetch(
        `http://localhost:5000/api/projectchat?${queryString}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching project chats:", error);
      throw error;
    }
  }

  static async getChatHistory(uniqueIdChat: string): Promise<ChatHistoryData> {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chathistory/${uniqueIdChat}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }
}

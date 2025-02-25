// services/api.ts

import { create_time_frame_query_string } from "@/hooks/TimeFrame/api";
import { TimeFrameParams } from "@/types/timeframe";

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
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export class ApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  static async get_project_chats(
    timeParams: TimeFrameParams
  ): Promise<ProjectChat[]> {
    try {
      const queryString = create_time_frame_query_string(timeParams);
      const response = await fetch(
        `${this.API_BASE_URL}/api/projectchat?${queryString}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const DATA = await response.json();
      return DATA;
    } catch (error) {
      console.error("Error fetching project chats:", error);
      throw error;
    }
  }

  static async get_chat_history(
    uniqueIdChat: string
  ): Promise<ChatHistoryData> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/api/chathistory/${uniqueIdChat}`
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

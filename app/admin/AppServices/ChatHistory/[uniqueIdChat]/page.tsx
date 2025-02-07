"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MessageCircle, Clock, Server, Globe } from "lucide-react";
import { ApiService } from "@/lib/ChatService/api";
import { useToast } from "@/hooks/use-toast";
import DynamicBreadcrumb from "@/components/Breadcrum";

interface ChatMessage {
  Timestamp: string;
  ChatID: string;
  Pertanyaan: string;
  Jawaban: string;
}

interface ChatHistoryData {
  UniqueIDChat: string;
  ServiceName: string;
  Environment: string;
  TotalMessages: number;
  ChatHistory: ChatMessage[];
}

const ChatHistoryPage = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const uniqueIdChat = params.uniqueIdChat as string;

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getChatHistory(uniqueIdChat);
        setChatHistory(data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch chat history. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (uniqueIdChat) {
      fetchChatHistory();
    }
  }, [uniqueIdChat, toast]);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 50.5908 77.6142 73.2051 50 73.2051C22.3858 73.2051 0 50.5908 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!chatHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No chat history available
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-2 py-2">
        <div className="mb-4 items-center gap-2">
          <DynamicBreadcrumb />
        </div>
        <Card className="mb-6 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Chat Session Details</h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-gray-500" />
              <span>Service: {chatHistory.ServiceName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <span>Environment: {chatHistory.Environment}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <span>Total Messages: {chatHistory.TotalMessages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>Session ID: {chatHistory.UniqueIDChat}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {chatHistory.ChatHistory.map((message, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MessageCircle
                    className={`h-6 w-6 ${
                      index % 2 === 0 ? "text-blue-500" : "text-green-500"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      {message.Timestamp}
                    </span>
                    <span className="text-xs text-gray-400">
                      Chat ID: {message.ChatID}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="font-semibold text-slate-700">Question:</h3>
                    <p className="text-slate-600 bg-slate-100 p-2 rounded">
                      {message.Pertanyaan}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700">Answer:</h3>
                    <p className="text-slate-600 bg-slate-100 p-2 rounded">
                      {message.Jawaban}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatHistoryPage;

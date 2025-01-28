"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sheet } from "lucide-react";
import React, { useState } from "react";
import { Label } from "recharts";

const page = () => {
  return (
    <div className="min-h-screen">
      <div className="ml-60 p-4 top-0 rounded-md">
        <div>
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-blue-500/50 dark:bg-stone-800 text-slate-600 dark:text-stone-400 font-medium text-sm">
                <div className="flex items-center pr-3">12231</div>
                <div className="flex items-center pl-3 border-l border-slate-600">
                  123131
                </div>
              </div>
            </div>
            <div className="flex h-16 relative items-center px-3 cursor-pointer  dark:text-stone-100 text-stone-950 border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex w-3/12 shrink-0 flex-1 relative h-full items-center p-2 gap-2 overflow-hidden">
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, SlidersHorizontal } from "lucide-react";

const DashboardNav = () => (
  <div className="flex items-center gap-4 pl-2 rounded-lg shadow-md py-2 px-4 bg-blue-600">
    <Avatar>
      <AvatarImage
        src="/images/user.png"
        alt="user"
        className="w-10 rounded-full"
      />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
    <Switch id="airplane-mode" className="bg-gray-300 border-transparent" />
    <Label
      htmlFor="real-time-mode"
      className="text-sm text-white flex items-center"
    >
      Real-time Mode
    </Label>
    <div className="relative flex items-center gap-2">
      <Select defaultValue="1m">
        <SelectTrigger className="w-28 bg-white/10 border-0 text-white hover:bg-white/20">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1m">1m</SelectItem>
          <SelectItem value="5m">5m</SelectItem>
          <SelectItem value="15m">15m</SelectItem>
          <SelectItem value="1h">1h</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="ml-60 left-0 right-0 z-50 flex h-[60px] items-center px-4 sm:px-10 transition-all duration-300 sticky top-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/30 pb-4">
      <h1 className="flex flex-1 text-xl font-semibold" />
      <DashboardNav />
    </header>
  );
};

export default NavBar;

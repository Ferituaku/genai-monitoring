import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NavBar = () => {
  return (
    <header className="sticky left-0 right-0 top-0 flex h-[80px] items-center justify-between px-4 sm:px-10 transition-all duration-300 pb-2 bg-white bg-opacity-0">
      <div className="flex items-start sm:ml-[200px] lg:ml-10"></div>
      <div className="flex items-center justify-end gap-4 pl-2 rounded-lg shadow-md py-2 px-4 bg-blue-600">
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
    </header>
  );
};

export default NavBar;

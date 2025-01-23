"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const NavBar = () => {
  const [theme, setTheme] = useState("dark");
  const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") || "dark";
  //   setTheme(savedTheme);
  //   document.documentElement.classList.toggle("dark", savedTheme === "dark");

  //   const handleScroll = () => {
  //     const isScrolled = window.scrollY > 0;
  //     setScrolled(isScrolled);
  //   };

  //   window.addEventListener("scroll", handleScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // const toggleTheme = () => {
  //   const newTheme = theme === "dark" ? "light" : "dark";
  //   setTheme(newTheme);
  //   localStorage.setItem("theme", newTheme);
  //   document.documentElement.classList.toggle("dark");
  // };

  return (
    <>
      <div
        className={`fixed ml-60 top-0 left-0 right-0 h-24 z-40 pointer-events-none
          bg-gradient-to-b 
          from-slate-900 
          via-slate-900/80 
          to-transparent
          transition-opacity duration-300
          ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <header
        className={`fixed ml-60 top-0 left-0 right-0 z-50 
          flex h-[60px] items-center px-4 sm:px-10
          transition-all duration-300
          ${
            scrolled
              ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50"
              : "bg-transparent"
          }`}
      >
        <h1 className="flex flex-1 text-xl font-semibold"></h1>
        <div className="flex items-center gap-4 pl-2 rounded-lg shadow-md py-2 px-4" style={{backgroundColor:"#3F79D2" }}>
          <Avatar>
            <AvatarImage
              src="/images/user.png"
              alt="user"
              className="w-8 rounded-full"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Switch
            id="airplane-mode"
            className="bg-gray-300 border-transparent"
          />
          <Label
            htmlFor="real-time-mode"
            className="text-sm text-white flex items-center"
          >
            Real-time Mode
          </Label>
          <div className="relative flex items-center gap-2">
            <select className="select p-2 rounded-md w-28 bg-secondary hover:bg-slate-400 transition-all duration-200 ease-in-out shadow-sm">
              <option>1m</option>
              <option>5m</option>
              <option>15m</option>
              <option>1h</option>
            </select>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;

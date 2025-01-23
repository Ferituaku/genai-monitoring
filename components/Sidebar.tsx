"use client";
import React, { useState } from "react";
import { JSX } from "react/jsx-dev-runtime";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { menuItems } from "@/components/SidebarIcons";
import SideButton from "./SidebarButton";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <aside
        aria-label="Sidebar"
        className={`fixed bg-blue-600 inset-y-0 shadow-lg rounded-lg left-2 top-2 bottom-2 z-30 flex flex-col text-white transition-all duration-300 ${
          isOpen ? "w-56" : "w-16 md:w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b border-blue-500">
          <div className="bg-white rounded-2xl p-2">
            <img
              src="/images/astra-big.png"
              alt="Logo"
              className={`w-full h-auto transition-transform duration-300   ${
                isOpen ? "scale-100" : "scale-100"
              }`}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-4 pt-4">
          {menuItems.map((item) => (
            <SideButton
              key={item.label}
              label={isOpen ? item.label : ""}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
        <div
          className="flex justify-end p-2 cursor-pointer opacity-25 hover:opacity-100 transition-all ease-in-out "
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6 text-white transition-transform duration-300 " />
          ) : (
            <ChevronRight className="w-6 h-6 text-white transition-transform duration-300" />
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

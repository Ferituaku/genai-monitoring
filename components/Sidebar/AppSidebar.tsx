"use client";
import React, { useState, useEffect } from "react";
import { JSX } from "react/jsx-dev-runtime";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { menuItems } from "@/components/sidebar/SidebarItems";
import SideButton from "./SidebarButton";
import { Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../ui/button";

interface SidebarProps {
  userRole?: "admin" | "user" | "user1";
  onSignOut?: () => void;
  onSidebarToggle?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}

export const AppSidebar = ({
  userRole = "admin",
  onSignOut,
  onSidebarToggle,
  defaultOpen = true,
}: SidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Handle sidebar state changes
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
  };

  // Update parent on mount
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen);
    }
  }, []);

  const getProfilePath = () => {
    switch (userRole) {
      case "admin":
        return "/admin/Profile";
      case "user1":
        return "/user1/Profile";
      default:
        return "/admin/Profile";
    }
  };
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <>
      <aside
        aria-label="Sidebar"
        className={cn(
          "fixed inset-y-0 ml-2 left-2 top-2 bottom-2 z-30 flex flex-col",
          "bg-blue-600 text-white shadow-lg rounded-lg",
          "transition-all duration-300 ease-in-out",
          isOpen ? "w-56" : "w-[68px]",
          "lg:static lg:mb-2 mt-2"
        )}
      >
        <div className="flex items-center gap-1 border-b border-blue-500/20 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex justify-center items-center w-full gap-2 p-2",
                "rounded-md text-sm font-medium",
                "bg-slate-100 transition-colors hover:bg-slate-300/70",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-white/20 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50 transition-all ease-in-out ",
                isOpen ? "w-full" : "hidden"
              )}
            >
              <img
                src={isOpen ? "/images/astra-big.png" : "/images/astra-big.png"}
                alt="Logo"
                className={cn(
                  "h-[20px] scale-150  transition-all duration-700 object-contain",
                  isOpen ? "w-auto" : "w-5"
                )}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuLabel>AI Monitoring</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={getProfilePath()}
                  className="flex items-center cursor-pointer"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Database</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="flex justify-end p-2 cursor-pointer opacity-60 hover:opacity-100 transition-all ease-in-out mt-auto"
            onClick={toggleSidebar}
          >
            {isOpen ? (
              <ChevronLeft className="w-6 h-9 text-white transition-transform duration-300 object-contain" />
            ) : (
              <ChevronRight className="w-6 h-9 text-white transition-transform duration-300 object-contain" />
            )}
          </Button>
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
      </aside>
    </>
  );
};

export default AppSidebar;

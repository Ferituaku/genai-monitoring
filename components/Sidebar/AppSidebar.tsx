"use client";
import React, { useState, useEffect } from "react";
import { JSX } from "react/jsx-dev-runtime";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { menuItems } from "@/components/Sidebar/SidebarItems";
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

interface SidebarProps {
  userRole?: "admin" | "user" | "user1";
  onSignOut?: () => void;
  onSidebarToggle?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}

export const AppSidebar = ({
  userRole = "user",
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
          "fixed inset-y-0 left-2 top-2 bottom-2 z-30 flex flex-col",
          "bg-blue-600 text-white shadow-lg rounded-lg",
          "transition-all duration-300 ease-in-out",
          isOpen ? "w-56" : "w-20",
          "lg:relative lg:left-0"
        )}
      >
        <div className="flex items-center border-b border-blue-500/20 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center w-full gap-2 px-2 py-1",
                "rounded-md text-sm font-medium",
                "transition-colors hover:bg-blue-500/70",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-white/20 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Building className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="truncate">AI Monitoring</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
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
          className="flex justify-end p-2 cursor-pointer opacity-25 hover:opacity-100 transition-all ease-in-out mt-auto"
          onClick={toggleSidebar}
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6 text-white transition-transform duration-300" />
          ) : (
            <ChevronRight className="w-6 h-6 text-white transition-transform duration-300" />
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;

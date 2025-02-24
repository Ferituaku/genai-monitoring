"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import SideButton from "./SidebarButton";
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
import { Button } from "../ui/button";
import { logout } from "@/lib/auth";
import { MENU_ITEMS } from "./SidebarItems";
import { UserRole } from "../Profile/types";

interface SidebarProps {
  userRole: UserRole;
  onSignOut?: () => void;
  onSidebarToggle?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}

export const AppSidebar = ({
  userRole = "user1",
  onSignOut,
  onSidebarToggle,
  defaultOpen = true,
}: SidebarProps) => {
  const PATHNAME = usePathname();
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

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    item.roles?.includes(userRole)
  );

  const getProfilePath = () => {
    switch (userRole) {
      case "admin":
        return "/admin/profile";
      case "user2":
        return "/user2/profile";
      default:
        return "/user1/profile";
    }
  };
  const handleSignOut = () => {
    logout();
  };
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <>
      <aside
        aria-label="Sidebar"
        className={cn(
          "fixed inset-y-0 ml-2 left-2 top-2 bottom-2 z-30 flex flex-col",
          "bg-blue-600 text-white shadow-lg rounded-lg",
          "transform transition-all duration-500 ease-in-out",
          isOpen ? "w-56" : "w-[68px]",
          "lg:static lg:mb-2 mt-2",
          isAnimating && "pointer-events-none"
        )}
      >
        <div className="flex items-center gap-1 border-b border-blue-500/20 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex justify-center items-center w-full gap-2 p-2",
                "rounded-md text-sm font-medium",
                "bg-slate-100 transition-all duration-300 ease-in-out",
                "hover:bg-slate-300/70 focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-white/20 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isOpen ? "w-full opacity-100" : "hidden"
              )}
            >
              <img
                src={
                  isOpen
                    ? "/openai/ai-monitor/images/astra-logo.png"
                    : "/openai/ai-monitor/images/astra-logo.png"
                }
                alt="Logo"
                className={cn(
                  "h-[20px] transition-all duration-500 object-contain",
                  isOpen ? "scale-100" : "scale-0"
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
              <DropdownMenuItem>User Management</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className={cn(
              "p-2 cursor-pointer transition-all duration-300",
              "hover:bg-blue-700 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-white/20"
            )}
            onClick={toggleSidebar}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-white transform transition-transform duration-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white transform transition-transform duration-300" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-4 pt-4 transition-all ease-in-out duration-500">
          {MENU_ITEMS.map((item) => {
            const isCurrentPath =
              PATHNAME?.toLowerCase() === item.href?.toLowerCase();
            console.log(`Checking ${item.label}:`, {
              PATHNAME,
              itemHref: item.href,
              isCurrentPath,
            });
            return (
              <SideButton
                key={item.label}
                label={isOpen ? item.label : ""}
                href={item.href}
                icon={item.icon}
                isActive={PATHNAME === item.href}
              />
            );
          })}
          {/* {filteredMenuItems.map((item) => (
          <SideButton
            key={item.label}
            label={isOpen ? item.label : ""}
            href={item.href}
            icon={item.icon}
            isActive={PATHNAME === item.href}
            isCollapsed={!isOpen}
          />
        ))} */}
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;

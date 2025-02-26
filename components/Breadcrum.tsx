"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DynamicBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  const basePath = "/openai/ai-monitor";
  const isAdminPage = pathname.includes(`/admin/`);

  const dashboardPath = isAdminPage
    ? `${basePath}/admin/dashboard`
    : `${basePath}/dashboard`;

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    // Remove trailing slash and split pathname
    const paths = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    // Generate array of breadcrumb items with paths
    return paths.map((path, index) => {
      // Build the href for this breadcrumb
      const href = `${basePath}/` + paths.slice(0, index + 1).join("/");

      // Format the label (capitalize first letter, replace hyphens with spaces)
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        href,
        label,
        isLast: index === paths.length - 1,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if we're on the homepage
  if (pathname === "/") return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link is always first */}
        <BreadcrumbItem>
          <BreadcrumbLink href={dashboardPath}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <span className="text-slate-600">{breadcrumb.label}</span>
              ) : (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadcrumb;

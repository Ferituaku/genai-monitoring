"use client";

import { ApplicationGrid } from "@/components/appsCatalogue/AppGrid";
import { ApplicationTable } from "@/components/appsCatalogue/AppTable";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { Input } from "@/components/ui/input";
import { mockApplications } from "@/hooks/Catalogue/mockApp";
import { Application } from "@/types/catalogue";

import React, { useState } from "react";

const Catalogue = () => {
  const [applications] = useState<Application[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
        <h1 className="p-4 font-semibold">Applications Catalogue</h1>
        <Input
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      <div className="top-20 rounded-lg">
        <div className="p-4">
          <ApplicationGrid applications={applications} />
        </div>
      </div>
    </div>
  );
};

export default Catalogue;

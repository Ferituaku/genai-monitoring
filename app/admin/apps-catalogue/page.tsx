"use client";

import { ApplicationGrid } from "@/components/AppsCatalogue/AppGrid";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { Input } from "@/components/ui/input";
import { ApplicationService } from "@/lib/CatalogueService/api";
import { Application } from "@/types/catalogue";
import { Search } from "lucide-react";

import React, { useState, useEffect } from "react";

const Catalogue = () => {
  const [APPLICATIONS, SET_APPLICATIONS] = useState<Application[]>([]);
  const [LOADING, SET_LOADING] = useState(true);
  const [ERROR, SET_ERROR] = useState<string | null>(null);
  const [SEARCH_QUERY, SET_SEARCH_QUERY] = useState("");

  useEffect(() => {
    const FETCH_APPLICATIONS = async () => {
      try {
        const SERVICE = new ApplicationService();
        const DATA = await SERVICE.getApplications();
        SET_APPLICATIONS(DATA);
        SET_LOADING(false);
      } catch (err) {
        SET_ERROR("Failed to fetch applications");
        SET_LOADING(false);
      }
    };

    FETCH_APPLICATIONS();
  }, []);
  const FILTERED_APPLICATION = APPLICATIONS.filter(
    (app) =>
      app &&
      app.ProjectName &&
      app.ProjectName.toLowerCase().includes(SEARCH_QUERY.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
        <h1 className="p-3 font-semibold">Applications Catalogue</h1>
        <div className="relative left-0 flex sm:w-[580px] lg:w-[250px]  items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari proyek"
            className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
            value={SEARCH_QUERY}
            onChange={(e) => SET_SEARCH_QUERY(e.target.value)}
          />
        </div>
      </div>
      <div className="top-20 rounded-lg">
        <div className="p-4">
          <ApplicationGrid APPLICATIONS={FILTERED_APPLICATION} />
        </div>
      </div>
    </div>
  );
};

export default Catalogue;

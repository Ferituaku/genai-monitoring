"use client";

import { ApplicationGrid } from "@/components/AppsCatalogue/AppGrid";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { Input } from "@/components/ui/input";
import { ApplicationService } from "@/hooks/Catalogue/useAppCatalogue";
import { Application } from "@/types/catalogue";
import { Search } from "lucide-react";

import React, { useState, useEffect } from "react";

const Catalogue = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const service = new ApplicationService();
        const data = await service.getApplications();
        setApplications(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch applications");
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
  const filteredApplications = applications.filter((app) =>
    app["Project name"].toLowerCase().includes(searchQuery.toLowerCase())
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="top-20 rounded-lg">
        <div className="p-4">
          <ApplicationGrid applications={filteredApplications} />
        </div>
      </div>
    </div>
  );
};

export default Catalogue;

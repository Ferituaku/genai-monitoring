import { Application } from "@/types/catalogue";
import React from "react";
import { ApplicationCard } from "./AppCard";

// components/ApplicationGrid/ApplicationGrid.tsx
interface ApplicationGridProps {
  APPLICATIONS: Application[];
}

export class ApplicationGrid extends React.Component<ApplicationGridProps> {
  render() {
    const { APPLICATIONS } = this.props;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {APPLICATIONS.map((app, index) => (
          <ApplicationCard key={index} application={app} />
        ))}
      </div>
    );
  }
}
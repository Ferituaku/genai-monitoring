import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Application } from "@/types/catalogue";
import { Activity, CalendarDays, Clock } from "lucide-react";
import React from "react";

interface ApplicationCardProps {
  application: Application;
}

export class ApplicationCard extends React.Component<ApplicationCardProps> {
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  render() {
    const { application } = this.props;
    return (
      <Card className="hover:shadow-lg hover:scale-105 transition-all border-l-blue-500 border-l-[6px]">
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {application["ProjectName"]}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>
                Total Requests: {application["JumlahRequest"].toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Created: {this.formatDate(application["CreatedAt"])}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Last Update: {this.formatDate(application["LastUpdate"])}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

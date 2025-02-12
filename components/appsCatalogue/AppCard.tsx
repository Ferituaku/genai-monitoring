import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Application } from "@/types/catalogue";
import { CalendarDays, Clock } from "lucide-react";
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
    });
  }

  render() {
    const { application } = this.props;
    return (
      <Card className="hover:shadow-lg hover:scale-105 transition-all">
        <CardHeader>
          <h3 className="text-lg font-semibold">{application.name}</h3>
          <span className="justify-end flex-1 text-xs font-light">
            Total Tokens:
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Created: {this.formatDate(application.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Last Update: {this.formatDate(application.lastUpdate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

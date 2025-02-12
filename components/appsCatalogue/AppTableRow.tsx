import { TableRow, TableCell } from "@/components/ui/table";
import { Application } from "@/types/catalogue";
import React from "react";

interface ApplicationTableRowProps {
  application: Application;
}

export class ApplicationTableRow extends React.Component<ApplicationTableRowProps> {
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  render() {
    const { application } = this.props;
    return (
      <TableRow>
        <TableCell className="font-medium">{application.name}</TableCell>
        <TableCell>{application.createdAt}</TableCell>
        <TableCell className="text-start">
          {this.formatDate(application.lastUpdated)}
        </TableCell>
      </TableRow>
    );
  }
}

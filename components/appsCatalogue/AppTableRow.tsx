import { TableRow, TableCell } from "@/components/ui/table";
import { Application } from "@/types/catalogue";
import React from "react";

interface ApplicationTableRowProps {
  APPLICATIONS: Application;
}

export class ApplicationTableRow extends React.Component<ApplicationTableRowProps> {
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  render() {
    const { APPLICATIONS } = this.props;
    return (
      <TableRow>
        <TableCell className="font-medium">
          {APPLICATIONS.ProjectName}
        </TableCell>
        <TableCell>{APPLICATIONS.CreatedAt}</TableCell>
        <TableCell className="text-start">
          {this.formatDate(APPLICATIONS.LastUpdate)}
        </TableCell>
      </TableRow>
    );
  }
}

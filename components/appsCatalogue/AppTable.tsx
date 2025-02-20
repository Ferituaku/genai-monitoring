import { Table, TableBody } from "@/components/ui/table";
import { Application } from "@/types/catalogue";
import React from "react";
import { ApplicationTableHeader } from "./AppTableHeader";
import { ApplicationTableRow } from "./AppTableRow";

interface ApplicationTableProps {
  APPLICATIONS: Application[];
}

export class ApplicationTable extends React.Component<ApplicationTableProps> {
  render() {
    const { APPLICATIONS } = this.props;
    return (
      <Table>
        <ApplicationTableHeader />
        <TableBody>
          {APPLICATIONS.map((app) => (
            <ApplicationTableRow key={app.ProjectName} APPLICATIONS={app} />
          ))}
        </TableBody>
      </Table>
    );
  }
}

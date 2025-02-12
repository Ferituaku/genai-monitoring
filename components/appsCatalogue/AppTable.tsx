import { Table, TableBody } from "@/components/ui/table";
import { Application } from "@/types/catalogue";
import React from "react";
import { ApplicationTableHeader } from "./AppTableHeader";
import { ApplicationTableRow } from "./AppTableRow";

interface ApplicationTableProps {
  applications: Application[];
}

export class ApplicationTable extends React.Component<ApplicationTableProps> {
  render() {
    const { applications } = this.props;
    return (
      <Table>
        <ApplicationTableHeader />
        <TableBody>
          {applications.map((app) => (
            <ApplicationTableRow key={app.name} application={app} />
          ))}
        </TableBody>
      </Table>
    );
  }
}

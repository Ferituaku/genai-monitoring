import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import React from "react";

export class ApplicationTableHeader extends React.Component {
  render() {
    return (
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
    );
  }
}

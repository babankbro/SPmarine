"use client";

import React, { useMemo } from "react";
import type { ChangeEvent } from "react";
import { 
  Box, 
  Typography, 
  Divider, 
  Card, 
  Checkbox,
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TablePagination 
} from "@mui/material";

import { useSelection } from "@/hooks/use-selection";
import type { Carrier } from "@/types/carrier";

interface CarrierTableProps {
  count: number;
  page: number;
  rows: Carrier[];
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function CarrierTable({ count, rows, page, rowsPerPage = 0, onPageChange, onRowsPerPageChange }: CarrierTableProps): React.JSX.Element {
  const rowIds = useMemo(() => {
    return rows.map((carrier) => carrier.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSize = selected?.size ?? 0;
  const selectedSome = selectedSize > 0 && selectedSize < rows.length;
  const selectedAll = rows.length > 0 && selectedSize === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: "800px" }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    event.target.checked ? selectAll() : deselectAll();
                  }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: Carrier) => {
              const isSelected = selected?.has(row.id) ?? false;

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        event.target.checked ? selectOne(row.id) : deselectOne(row.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                      <Typography variant="subtitle2">{row.name}</Typography>
                  </TableCell>
                  <TableCell>{row.latitude}</TableCell>
                  <TableCell>{row.longitude}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange ?? ((_, __) => {
          // TODO: Implement proper pagination handling
        })}
        onRowsPerPageChange={onRowsPerPageChange ?? (() => {
          // TODO: Implement proper rows per page handling
        })}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}

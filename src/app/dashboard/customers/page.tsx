"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import axios from "axios";
import dayjs from "dayjs";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import type { Customer } from "@/components/dashboard/customer/customers-table";
import { CustomersFilters } from "@/components/dashboard/customer/customers-filters";
import { CustomersTable } from "@/components/dashboard/customer/customers-table";

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

const customers = [
  {
    id: "USR-010",
    name: "Alcides Antonio",
    avatar: "/assets/avatar-10.png",
    email: "alcides.antonio@devias.io",
    phone: "908-691-3242",
    address: { city: "Madrid", country: "Spain", state: "Comunidad de Madrid", street: "4158 Hedge Street" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-009",
    name: "Marcus Finn",
    avatar: "/assets/avatar-9.png",
    email: "marcus.finn@devias.io",
    phone: "415-907-2647",
    address: { city: "Carson City", country: "USA", state: "Nevada", street: "2188 Armbrester Drive" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-008",
    name: "Jie Yan",
    avatar: "/assets/avatar-8.png",
    email: "jie.yan.song@devias.io",
    phone: "770-635-2682",
    address: { city: "North Canton", country: "USA", state: "Ohio", street: "4894 Lakeland Park Drive" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-007",
    name: "Nasimiyu Danai",
    avatar: "/assets/avatar-7.png",
    email: "nasimiyu.danai@devias.io",
    phone: "801-301-7894",
    address: { city: "Salt Lake City", country: "USA", state: "Utah", street: "368 Lamberts Branch Road" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-006",
    name: "Iulia Albu",
    avatar: "/assets/avatar-6.png",
    email: "iulia.albu@devias.io",
    phone: "313-812-8947",
    address: { city: "Murray", country: "USA", state: "Utah", street: "3934 Wildrose Lane" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-005",
    name: "Fran Perez",
    avatar: "/assets/avatar-5.png",
    email: "fran.perez@devias.io",
    phone: "712-351-5711",
    address: { city: "Atlanta", country: "USA", state: "Georgia", street: "1865 Pleasant Hill Road" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-004",
    name: "Penjani Inyene",
    avatar: "/assets/avatar-4.png",
    email: "penjani.inyene@devias.io",
    phone: "858-602-3409",
    address: { city: "Berkeley", country: "USA", state: "California", street: "317 Angus Road" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-003",
    name: "Carson Darrin",
    avatar: "/assets/avatar-3.png",
    email: "carson.darrin@devias.io",
    phone: "304-428-3097",
    address: { city: "Cleveland", country: "USA", state: "Ohio", street: "2849 Fulton Street" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-002",
    name: "Siegbert Gottfried",
    avatar: "/assets/avatar-2.png",
    email: "siegbert.gottfried@devias.io",
    phone: "702-661-1654",
    address: { city: "Los Angeles", country: "USA", state: "California", street: "1798 Hickory Ridge Drive" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
  {
    id: "USR-001",
    name: "Miron Vitold",
    avatar: "/assets/avatar-1.png",
    email: "miron.vitold@devias.io",
    phone: "972-333-4106",
    address: { city: "San Diego", country: "USA", state: "California", street: "75247" },
    createdAt: dayjs().subtract(2, "hours").toDate(),
  },
] satisfies Customer[];

export default function Page(): React.JSX.Element {
  // Use state with a proper file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const page = 0;
  const rowsPerPage = 5;
  const [notification, setNotification] = React.useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  const handleImport = async (): Promise<void> => {
    if (!selectedFile) {
      setNotification({ message: "Please select a file first", severity: "error" });
      setOpenSnackbar(true);
      return;
    }

    const formdata = new FormData();
    formdata.append("file", selectedFile);

    try {
      const res = await axios.post("order/upload", formdata, { headers: { "Content-Type": "multipart/form-data" } });
      setNotification({ message: `Import successful: ${res.status}`, severity: "success" });
      setOpenSnackbar(true);
      // Reset the file input after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNotification({ message: `Import failed: ${errorMessage}`, severity: "error" });
      setOpenSnackbar(true);
    }
  };

  const handleExport = (): void => {
    setNotification({ message: 'Export functionality not yet implemented', severity: 'error' });
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (): void => {
    setOpenSnackbar(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setNotification({ message: `File selected: ${e.target.files[0].name}`, severity: "success" });
      setOpenSnackbar(true);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4">Customers</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <input
              accept=".csv,.xlsx,.xls"
              id="upload-file"
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file">
              <Button
                color="inherit"
                component="span"
                startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              >
                Select File
              </Button>
            </label>
            <Button
              color="inherit"
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleImport}
              disabled={!selectedFile}
            >
              Upload
            </Button>
            <Button
              color="inherit"
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Stack>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      <CustomersFilters />
      <CustomersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />
      <Snackbar 
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        {notification ? (
          <Alert 
            onClose={handleSnackbarClose} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

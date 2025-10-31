import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Fade,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PageviewIcon from "@mui/icons-material/Pageview";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// === Helper ===
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// === Mock Data ===
const mockSiswa = [
  { id: "S-001", nis: "102030", nama: "Budi Santoso" },
  { id: "S-002", nis: "102031", nama: "Ani Yudhoyono" },
  { id: "S-003", nis: "102032", nama: "Charlie van Houten" },
  { id: "S-004", nis: "102033", nama: "Dewi Lestari" },
  { id: "S-005", nis: "102034", nama: "Eka Kurniawan" },
];

// === Komponen Utama ===
const HalamanAbsensiHarian = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedKelas, setSelectedKelas] = useState("");
  const [rows, setRows] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // === Handler ===
  const handleTampilkan = () => {
    if (!selectedKelas) {
      setSnackbar({
        open: true,
        message: "Silakan pilih kelas terlebih dahulu.",
        severity: "warning",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRows(mockSiswa);
      const data = {};
      mockSiswa.forEach((s) => (data[s.id] = "H")); // default hadir semua
      setDailyAttendance(data);
      setLoading(false);
      setSnackbar({
        open: true,
        message: `Data absensi kelas ${selectedKelas} tanggal ${selectedDate} dimuat.`,
        severity: "success",
      });
    }, 800);
  };

  const handleAttendanceChange = (studentId, newStatus) => {
    setDailyAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus || "H",
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    rows.forEach((r) => (updated[r.id] = "H"));
    setDailyAttendance(updated);
    setSnackbar({
      open: true,
      message: "Semua siswa ditandai Hadir.",
      severity: "info",
    });
  };

  const handleSimpanAbsensi = () => {
    setLoading(true);
    const dataSimpan = rows.map((r) => ({
      siswaId: r.id,
      status: dailyAttendance[r.id] || "H",
      tanggal: selectedDate,
      kelas: selectedKelas,
    }));
    console.log("Data Disimpan:", dataSimpan);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Absensi berhasil disimpan!",
        severity: "success",
      });
    }, 1000);
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // === Kolom DataGrid ===
  const columns = [
    { field: "nis", headerName: "NIS", width: 130 },
    { field: "nama", headerName: "Nama Siswa", flex: 1, minWidth: 250 },
    {
      field: "absensi",
      headerName: "Status Kehadiran",
      width: 250,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        const status = dailyAttendance[params.row.id] || "H";
        return (
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(e, newStatus) =>
              handleAttendanceChange(params.row.id, newStatus)
            }
            aria-label="Status Kehadiran"
            size="small"
          >
            <ToggleButton value="H" color="success" sx={{ fontWeight: 600 }}>
              H
            </ToggleButton>
            <ToggleButton value="S" color="info" sx={{ fontWeight: 600 }}>
              S
            </ToggleButton>
            <ToggleButton value="I" color="warning" sx={{ fontWeight: 600 }}>
              I
            </ToggleButton>
            <ToggleButton value="A" color="error" sx={{ fontWeight: 600 }}>
              A
            </ToggleButton>
          </ToggleButtonGroup>
        );
      },
    },
  ];

  // === Render ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "grey.50", p: { xs: 1, sm: 2, md: 3 } }}>
      {/* FILTER */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Tanggal"
                type="date"
                size="small"
                fullWidth
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth size="small" required>
                <InputLabel>Pilih Kelas</InputLabel>
                <Select
                  value={selectedKelas}
                  label="Pilih Kelas"
                  onChange={(e) => setSelectedKelas(e.target.value)}
                >
                  <MenuItem value="10A">10A</MenuItem>
                  <MenuItem value="10B">10B</MenuItem>
                  <MenuItem value="11A">11A</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button
              fullWidth
              variant="contained"
              startIcon={<PageviewIcon />}
              onClick={handleTampilkan}
            >
              Tampilkan
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* DATA GRID */}
      {rows.length > 0 && (
        <Fade in={true}>
          <Card>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Absensi Harian Kelas {selectedKelas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tanggal:{" "}
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    dateStyle: "full",
                  })}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={handleMarkAllPresent}
              >
                Tandai Hadir Semua
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                loading={loading}
                pageSizeOptions={[10, 15, 20]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "grey.100",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>

            <DialogActions
              sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSimpanAbsensi}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Absensi"}
              </Button>
            </DialogActions>
          </Card>
        </Fade>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanAbsensiHarian;

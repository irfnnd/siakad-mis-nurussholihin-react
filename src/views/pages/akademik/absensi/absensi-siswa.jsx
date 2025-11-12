import React, { useState, useEffect } from 'react';
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
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageviewIcon from '@mui/icons-material/Pageview';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// === Helper ===
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// === Mock Data ===
// Data siswa dipetakan berdasarkan kelas
const mockSiswaByKelas = {
  '10A': [
    { id: 'S-001', nis: '102030', nama: 'Budi Santoso' },
    { id: 'S-002', nis: '102031', nama: 'Ani Yudhoyono' }
  ],
  '10B': [
    { id: 'S-101', nis: '102040', nama: 'Charlie van Houten' },
    { id: 'S-102', nis: '102041', nama: 'Dewi Lestari' }
  ],
  '11A': [
    { id: 'S-201', nis: '102050', nama: 'Eka Kurniawan' }
  ]
};

// Data absensi yang sudah ada (simulasi)
const mockExistingAttendance = {
  // 'YYYY-MM-DD'
  '2025-11-12': { 
    'S-002': 'S', // Ani Sakit
    'S-101': 'A'  // Charlie Alpha
  }
};


// === Komponen Utama ===
// Menerima props: role ('admin'/'guru') dan waliKelasInfo
// Berikan objek sebagai default, sesuai yang diharapkan oleh kode Anda
const HalamanAbsensiHarian = ({ role = 'guru', waliKelasInfo = { id: '10A', nama: 'Kelas 10A' } }) => {
  
  // Cek apakah user adalah Wali Kelas
  const isWaliKelas = role === 'guru' && !!waliKelasInfo;

  // === STATE ===
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  // 'selectedKelas' akan di-set oleh Admin (dropdown) atau oleh Wali Kelas (otomatis)
  const [selectedKelas, setSelectedKelas] = useState('');
  
  const [rows, setRows] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  // === EFEK (LOGIKA OTOMATIS GURU) ===

  // Efek 1: Set kelas untuk Wali Kelas secara otomatis saat komponen dimuat
  useEffect(() => {
    if (isWaliKelas) {
      // Asumsi waliKelasInfo memiliki { id: '10A', nama: '10A' }
      setSelectedKelas(waliKelasInfo.id); 
    }
  }, [isWaliKelas, waliKelasInfo]);

  // Efek 2: Muat data untuk Wali Kelas secara otomatis saat tanggal ATAU kelas (dari Efek 1) berubah
  useEffect(() => {
    // Hanya jalankan jika dia Wali Kelas dan 'selectedKelas' sudah di-set
    if (isWaliKelas && selectedKelas) {
      handleTampilkan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaliKelas, selectedKelas, selectedDate]); // Muat ulang jika tanggal berubah
  

  // === Handler ===
  
  // Fungsi 'handleTampilkan' sekarang digunakan oleh:
  // 1. Admin (via tombol)
  // 2. Wali Kelas (via useEffect)
  const handleTampilkan = () => {
    if (!selectedKelas) {
      if (!isWaliKelas) { // Hanya tampilkan error untuk Admin, Guru masih loading
        setSnackbar({
          open: true,
          message: 'Silakan pilih kelas terlebih dahulu.',
          severity: 'warning'
        });
      }
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      // Ambil daftar siswa berdasarkan 'selectedKelas'
      const siswaDiKelas = mockSiswaByKelas[selectedKelas] || [];
      setRows(siswaDiKelas);
      
      const data = {};
      const existingData = mockExistingAttendance[selectedDate] || {};
      
      siswaDiKelas.forEach((s) => {
        // Cek apakah sudah ada data absensi di tanggal ini
        if (existingData[s.id]) {
          data[s.id] = existingData[s.id];
        } else {
          data[s.id] = 'H'; // Default hadir
        }
      });
      
      setDailyAttendance(data);
      setLoading(false);
      
      // Hanya tampilkan notifikasi jika BUKAN loading otomatis (Admin)
      if (!isWaliKelas) {
        setSnackbar({
          open: true,
          message: `Data absensi kelas ${selectedKelas} tanggal ${selectedDate} dimuat.`,
          severity: 'success'
        });
      }
    }, 800);
  };

  const handleAttendanceChange = (studentId, newStatus) => {
    setDailyAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus || 'H'
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    rows.forEach((r) => (updated[r.id] = 'H'));
    setDailyAttendance(updated);
    setSnackbar({
      open: true,
      message: 'Semua siswa ditandai Hadir.',
      severity: 'info'
    });
  };

  const handleSimpanAbsensi = () => {
    setLoading(true);
    const dataSimpan = rows.map((r) => ({
      siswaId: r.id,
      status: dailyAttendance[r.id] || 'H',
      tanggal: selectedDate,
      kelas: selectedKelas
    }));
    console.log('Data Disimpan:', dataSimpan);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Absensi berhasil disimpan!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // === Kolom DataGrid ===
  const columns = [
    { field: 'nis', headerName: 'NIS', width: 130 },
    { field: 'nama', headerName: 'Nama Siswa', flex: 1, minWidth: 250 },
    {
      field: 'absensi',
      headerName: 'Status Kehadiran',
      width: 250,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const status = dailyAttendance[params.row.id] || 'H';
        return (
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(e, newStatus) => handleAttendanceChange(params.row.id, newStatus)}
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
      }
    }
  ];

  // === Render ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 2 } }}>
      {/* FILTER */}
      <Card sx={{ mb: 1, p: 2 }}>
        {/*
          CATATAN: Tetap menggunakan 'Grid size' sesuai permintaan Anda. 
          Prop 'spacing={2}' pada item Grid kedua tidak valid dan akan diabaikan oleh MUI.
        */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <TextField
              label="Tanggal"
              type="date"
              size="small"
              fullWidth
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* --- KONDISI ROLE DIMULAI --- */}
          {isWaliKelas ? (
            // TAMPILAN GURU/WALI KELAS (Read-only TextField)
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <TextField
                label="Kelas Anda"
                size="small"
                fullWidth
                value={waliKelasInfo.nama} // Asumsi props: { id: '10A', nama: '10A' }
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontWeight: 600, color: 'primary.main' } }}
              />
            </Grid>
          ) : (
            // TAMPILAN ADMIN (Dropdown)
            <Grid size={{ xs: 6, sm: 6, md: 2 }} spacing={2}> {/* Tetap 'size' & 'spacing' */}
              <FormControl fullWidth size="small" required>
                <InputLabel>Pilih Kelas</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                  {/* Di aplikasi nyata, Anda akan fetch daftar kelas ini */}
                  <MenuItem value="10A">10A</MenuItem>
                  <MenuItem value="10B">10B</MenuItem>
                  <MenuItem value="11A">11A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {/* --- KONDISI ROLE SELESAI --- */}
          

          {/* Tombol Tampilkan hanya untuk Admin */}
          {!isWaliKelas && (
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan}>
                Tampilkan
              </Button>
            </Grid>
          )}

        </Grid>
      </Card>

      {/* DATA GRID */}
      {/* Cek 'rows.length > 0' untuk menampilkan tabel */}
      {rows.length > 0 && (
        <Fade in={true}>
          <Card>
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Absensi Harian Kelas {selectedKelas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tanggal:{' '}
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    dateStyle: 'full'
                  })}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<CheckCircleOutlineIcon />} onClick={handleMarkAllPresent}>
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
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'grey.100',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Box>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanAbsensi} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Absensi'}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanAbsensiHarian;
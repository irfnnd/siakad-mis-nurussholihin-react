import React, { useState } from 'react';
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
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Snackbar, 
  Alert, 
  Fade,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// --- DATA MOCKUP UNTUK JADWAL ---
// Di aplikasi nyata, ini akan datang dari state atau API
const mockScheduleData = [
  { 
    time: '07:15 - 08:45',
    senin: { id: 1, mapel: 'Matematika', guru: 'Budi Hartono, S.Pd.' },
    selasa: { id: 2, mapel: 'B. Indonesia', guru: 'Siti Aminah, M.Pd.' },
    rabu: null,
    kamis: { id: 3, mapel: 'Matematika', guru: 'Budi Hartono, S.Pd.' },
    jumat: { id: 4, mapel: 'Fisika', guru: 'Endang S, S.Si.' },
    sabtu: null
  },
  {
    time: '08:45 - 09:15',
    istirahat: true
  },
  { 
    time: '09:15 - 10:45',
    senin: { id: 5, mapel: 'Biologi', guru: 'Rina Marlina, S.Pd.' },
    selasa: { id: 6, mapel: 'B. Inggris', guru: 'Dian P, S.S.' },
    rabu: { id: 6, mapel: 'B. Inggris', guru: 'Dian P, S.S.' },
    kamis: { id: 7, mapel: 'Kimia', guru: 'Ahmad, S.Si.' },
    jumat: { id: 8, mapel: 'Ekonomi', guru: 'Dewi, S.E.' },
    sabtu: { id: 9, mapel: 'Ekonomi', guru: 'Dewi, S.E.' }
  },
  // ... tambahkan baris data lain sesuai kebutuhan
];

// Daftar hari untuk mapping di tabel
const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

// --- KOMPONEN UTAMA ---
const JadwalPelajaran = () => {

  // === STATE MANAGEMENT ===
  // State untuk filter
  const [selectedKelas, setSelectedKelas] = useState('10A');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2024/2025');

  // State untuk Dialog Form
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null); // Data yang sedang diedit/dihapus

  // State untuk Dialog Konfirmasi Hapus
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // State untuk Snackbar (Notifikasi)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // === HANDLER UNTUK FORM DIALOG ===
  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setCurrentEntry(null);
    setOpenFormDialog(true);
  };

  const handleOpenEditDialog = (entry) => {
    setIsEditMode(true);
    setCurrentEntry(entry); // Simpan data entri yang akan diedit
    setOpenFormDialog(true);
  };

  const handleCloseForm = () => {
    setOpenFormDialog(false);
    setCurrentEntry(null); // Bersihkan data
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (isEditMode) {
      console.log('Memperbarui data:', data, 'dengan ID:', currentEntry.id);
      // Logika API untuk UPDATE di sini
      setSnackbar({ open: true, message: 'Entri jadwal berhasil diperbarui!', severity: 'success' });
    } else {
      console.log('Menyimpan data baru:', data);
      // Logika API untuk CREATE di sini
      setSnackbar({ open: true, message: 'Entri jadwal baru berhasil disimpan!', severity: 'success' });
    }
    
    handleCloseForm();
    // Di sini Anda akan memanggil fungsi untuk memuat ulang data (refetch)
  };

  // === HANDLER UNTUK DIALOG HAPUS ===
  const handleOpenConfirmDelete = (entry) => {
    setCurrentEntry(entry);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmDialog(false);
    setCurrentEntry(null);
  };

  const handleConfirmDelete = () => {
    console.log('Menghapus data:', currentEntry.id);
    // Logika API untuk DELETE di sini
    handleCloseConfirm();
    setSnackbar({ open: true, message: 'Entri jadwal telah dihapus!', severity: 'error' });
    // Panggil fungsi refetch data di sini
  };

  // === HANDLER UNTUK SNACKBAR ===
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // === RENDER KOMPONEN ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* === Header & Filter === */}
      <Card sx={{ mb:{ xs: 1, sm: 1.5, md: 3 }, p: { xs: 1, sm: 1.5, md: 2 } }}>
        {/* Container utama. 
          justifyContent="space-between" akan mendorong:
          1. (Grup Filter) ke kiri
          2. (Tombol) ke kanan
        */}
        <Grid size={{ xs: 11, sm: 7, md: 3}} spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center" justifyContent="space-between">
          
          {/* ITEM 1: Grup Filter
            - 'xs={12}' membuatnya full-width di mobile.
            - 'sm' (tanpa angka) membuatnya mengambil sisa ruang di layar 'sm' ke atas.
          */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* Gunakan Stack untuk mengatur 2 filter:
              - direction="column" di mobile (xs)
              - direction="row" di layar 'sm' ke atas
            */}
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Pilih Kelas</InputLabel>
                <Select
                  value={selectedKelas}
                  label="Pilih Kelas"
                  onChange={(e) => setSelectedKelas(e.target.value)}
                >
                  <MenuItem value="10A">10A</MenuItem>
                  <MenuItem value="10B">10B</MenuItem>
                  <MenuItem value="11A">11A</MenuItem>
                  <MenuItem value="11B">11B</MenuItem>
                  <MenuItem value="12A">12A</MenuItem>
                  <MenuItem value="12B">12B</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Tahun Ajaran</InputLabel>
                <Select
                  value={selectedTahunAjaran}
                  label="Tahun Ajaran"
                  onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                >
                  <MenuItem value="2024/2025">2024/2025</MenuItem>
                  <MenuItem value="2023/2024">2023/2024</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* ITEM 2: Tombol Aksi
            - 'xs={12}' membuatnya full-width di mobile (di bawah filter).
            - 'sm="auto"' membuatnya pas seukuran tombol di layar 'sm' ke atas.
          */}
          <Grid size={{ xs: 12, sm: 'auto', md: 3 }} sm="auto">
            <Button 
              fullWidth // 'fullWidth' akan mengisi 'Grid item xs={12}' (bagus untuk mobile)
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Tambah Entri Jadwal
            </Button>
          </Grid>
          
        </Grid>
      </Card>

      {/* === Tampilan Tabel Jadwal === */}
      <Card>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Jadwal Pelajaran - Kelas {selectedKelas}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tahun Ajaran {selectedTahunAjaran}
          </Typography>
        </Box>
        
        <TableContainer component={Paper} sx={{ overflow: 'auto', border: 'none', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 800 }} aria-label="tabel jadwal pelajaran">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Jam</TableCell>
                {days.map(day => (
                  <TableCell key={day} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            
            <TableBody>
              {mockScheduleData.map((row) => (
                row.istirahat ? (
                  // Baris Istirahat
                  <TableRow key={row.time} sx={{ bgcolor: 'success.lighter' }}>
                    <TableCell component="th" scope="row">{row.time}</TableCell>
                    <TableCell colSpan={6} align="center" sx={{ fontWeight: 'bold' }}>
                      <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} /> ISTIRAHAT
                    </TableCell>
                  </TableRow>
                ) : (
                  // Baris Mata Pelajaran
                  <TableRow key={row.time} hover>
                    <TableCell component="th" scope="row">{row.time}</TableCell>
                    {days.map(day => {
                      const entry = row[day]; // Ambil data entri untuk hari itu
                      return (
                        <TableCell key={day} sx={{ verticalAlign: 'top', ...(entry ? {} : { bgcolor: 'grey.50' }) }}>
                          {entry && (
                            <Box sx={{ position: 'relative', pt: 2, pb: 1 }}>
                              <Typography variant="body2" fontWeight={500}>{entry.mapel}</Typography>
                              <Typography variant="caption" color="text.secondary">{entry.guru}</Typography>
                              
                              {/* Tombol Aksi Edit & Hapus */}
                              <Stack direction="row" sx={{ position: 'absolute', top: -10, right: -10 }}>
                                <IconButton size="small" onClick={() => handleOpenEditDialog(entry)}>
                                  <EditIcon fontSize="inherit" color="primary" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleOpenConfirmDelete(entry)}>
                                  <DeleteIcon fontSize="inherit" color="error" />
                                </IconButton>
                              </Stack>
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* === Dialog Form Tambah/Edit Entri Jadwal === */}
      <Dialog 
        open={openFormDialog} 
        onClose={handleCloseForm} 
        fullWidth 
        maxWidth="sm"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CalendarMonthIcon />
          {isEditMode ? 'Edit Entri Jadwal' : 'Tambah Entri Jadwal Baru'}
        </DialogTitle>
        
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container size={{ xs: 12 }} spacing={2}>
              <Grid size={{ xs: 6, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Kelas</InputLabel>
                  <Select name="kelas" label="Kelas" defaultValue={currentEntry?.kelas || selectedKelas}>
                    <MenuItem value="10A">10A</MenuItem>
                    <MenuItem value="10B">10B</MenuItem>
                    <MenuItem value="11A">11A</MenuItem>
                    <MenuItem value="11B">11B</MenuItem>
                    <MenuItem value="12A">12A</MenuItem>
                    <MenuItem value="12B">12B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Hari</InputLabel>
                  <Select name="hari" label="Hari" defaultValue={currentEntry?.hari || ''}>
                    <MenuItem value="Senin">Senin</MenuItem>
                    <MenuItem value="Selasa">Selasa</MenuItem>
                    <MenuItem value="Rabu">Rabu</MenuItem>
                    <MenuItem value="Kamis">Kamis</MenuItem>
                    <MenuItem value="Jumat">Jumat</MenuItem>
                    <MenuItem value="Sabtu">Sabtu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 6 }}>
                <TextField 
                  name="jamMulai" 
                  label="Jam Mulai" 
                  type="time"
                  fullWidth 
                  required
                  InputLabelProps={{ shrink: true }}
                  defaultValue={currentEntry?.jamMulai || '07:15'}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 6 }}>
                <TextField 
                  name="jamSelesai" 
                  label="Jam Selesai" 
                  type="time"
                  fullWidth 
                  required
                  InputLabelProps={{ shrink: true }}
                  defaultValue={currentEntry?.jamSelesai || '08:45'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Mata Pelajaran</InputLabel>
                  {/* Di aplikasi nyata, ini akan di-map dari API */}
                  <Select name="mapel" label="Mata Pelajaran" defaultValue={currentEntry?.mapel || ''}>
                    <MenuItem value="Matematika">Matematika</MenuItem>
                    <MenuItem value="Fisika">Fisika</MenuItem>
                    <MenuItem value="Biologi">Biologi</MenuItem>
                    <MenuItem value="Kimia">Kimia</MenuItem>
                    <MenuItem value="B. Indonesia">B. Indonesia</MenuItem>
                    <MenuItem value="B. Inggris">B. Inggris</MenuItem>
                    <MenuItem value="Ekonomi">Ekonomi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Guru Pengajar</InputLabel>
                  {/* Di aplikasi nyata, ini akan di-map dari API */}
                  <Select name="guru" label="Guru Pengajar" defaultValue={currentEntry?.guru || ''}>
                    <MenuItem value="Budi Hartono, S.Pd.">Budi Hartono, S.Pd.</MenuItem>
                    <MenuItem value="Siti Aminah, M.Pd.">Siti Aminah, M.Pd.</MenuItem>
                    <MenuItem value="Endang S, S.Si.">Endang S, S.Si.</MenuItem>
                    <MenuItem value="Rina Marlina, S.Pd.">Rina Marlina, S.Pd.</MenuItem>
                    <MenuItem value="Dian P, S.S.">Dian P, S.S.</MenuItem>
                    <MenuItem value="Ahmad, S.Si.">Ahmad, S.Si.</MenuItem>
                    <MenuItem value="Dewi, S.E.">Dewi, S.E.</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseForm} variant="outlined">Batal</Button>
            <Button type="submit" variant="contained" size="large">
              {isEditMode ? 'Perbarui Entri' : 'Simpan Entri'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* === Dialog Konfirmasi Hapus === */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={handleCloseConfirm}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ color: 'error.main' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tindakan ini tidak dapat dibatalkan!
          </Alert>
          <Typography>
            Apakah Anda yakin ingin menghapus jadwal <strong>{currentEntry?.mapel}</strong> ({currentEntry?.guru})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* === Snackbar Notifikasi === */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
    </Box>
  );
};

export default JadwalPelajaran;
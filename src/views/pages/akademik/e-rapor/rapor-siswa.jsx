import React, { useState } from 'react';
import { 
  Box, Grid, Card, FormControl, InputLabel, Select, MenuItem, Button, 
  Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography, 
  Snackbar, Alert, Fade, TextField, Avatar, List, ListItem, ListItemButton,
  ListItemAvatar, ListItemText, Divider, Tabs, Tab, Paper, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell, Chip
} from '@mui/material';
import PageviewIcon from '@mui/icons-material/Pageview';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SaveIcon from '@mui/icons-material/Save';

// --- DATA MOCKUP ---
// (Di aplikasi nyata, ini di-fetch dari API)

// 1. Daftar siswa di kelas (setelah filter)
const mockStudentList = [
  { id: 'S-001', nis: '102030', nama: 'Budi Santoso' },
  { id: 'S-002', nis: '102031', nama: 'Ani Yudhoyono' },
  { id: 'S-003', nis: '102032', nama: 'Charlie van Houten' },
  { id: 'S-004', nis: '102033', nama: 'Dewi Lestari' },
];

// 2. Data Rapor Detail (muncul setelah klik siswa)
// Ini adalah data MATANG yang sudah dikalkulasi dari modul lain
const mockReportData = {
  info: { id: 'S-001', nis: '102030', nisn: '0012345678', nama: 'Budi Santoso', kelas: '10A' },
  academic: [
    { id: 'M-01', mapel: 'Matematika', nilai: 91, predikat: 'A' },
    { id: 'M-02', mapel: 'Fisika', nilai: 87, predikat: 'B' },
    { id: 'M-03', mapel: 'Bahasa Indonesia', nilai: 90, predikat: 'A' },
    { id: 'M-04', mapel: 'Bahasa Inggris', nilai: 88, predikat: 'B' },
    // ...mapel lain
  ],
  nonAcademic: {
    // Data ini ditarik dari Modul Absensi
    attendance: { sakit: 1, izin: 2, alpha: 0 },
    // Data ini ditarik dari modul Ekskul/Kesiswaan
    extracurricular: [
      { id: 'E-01', nama: 'Pramuka', nilai: 'A', deskripsi: 'Sangat aktif dan menunjukkan jiwa kepemimpinan.' },
      { id: 'E-02', nama: 'OSIS', nilai: 'B', deskripsi: 'Berpartisipasi aktif dalam kepanitiaan.' },
    ],
    // Data ini ditarik dari Modul Penilaian Sikap
    sikap: {
      spiritual: 'Sangat Baik',
      sosial: 'Baik',
    }
  },
  // Data ini khas milik Wali Kelas
  catatanWaliKelas: 'Budi menunjukkan kemajuan yang sangat pesat di semester ini, terutama di bidang akademik. Pertahankan semangat belajarmu!',
};
// --- END DATA MOCKUP ---


// Komponen kecil untuk Tab Panel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// --- KOMPONEN UTAMA ---
const HalamanRaporSiswa = () => {

  // === STATE ===
  // Filter
  const [selectedTahun, setSelectedTahun] = useState('2024/2025');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedKelas, setSelectedKelas] = useState(''); // Kelas yang diampu Wali Kelas

  // Data
  const [studentList, setStudentList] = useState([]); // Daftar siswa di kelas
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState(null); // Data rapor siswa terpilih
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [catatan, setCatatan] = useState(''); // State lokal untuk mengedit catatan
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // === HANDLER ===
  const handleTampilkanSiswa = () => {
    if (!selectedKelas) {
      setSnackbar({ open: true, message: 'Silakan pilih kelas Anda.', severity: 'warning' });
      return;
    }
    setLoading(true);
    // Simulasi fetch daftar siswa
    setTimeout(() => {
      setStudentList(mockStudentList);
      setReportData(null); // Kosongkan pratinjau
      setSelectedStudentId('');
      setLoading(false);
      setSnackbar({ open: true, message: `Daftar siswa kelas ${selectedKelas} dimuat.`, severity: 'success' });
    }, 1000);
  };

  const handleSelectStudent = (studentId) => {
    setLoadingReport(true);
    setSelectedStudentId(studentId);
    
    // Simulasi fetch data rapor detail untuk siswa
    setTimeout(() => {
      setReportData(mockReportData);
      setCatatan(mockReportData.catatanWaliKelas); // Muat catatan ke state editor
      setTabIndex(0); // Selalu reset ke tab pertama
      setLoadingReport(false);
    }, 800);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSimpanCatatan = () => {
    // Simulasi API save
    console.log('Menyimpan catatan baru:', catatan, 'untuk siswa ID:', reportData.info.id);
    setSnackbar({ open: true, message: 'Catatan wali kelas berhasil disimpan.', severity: 'success' });
  };

  const handleCetakPDF = () => {
    // Logika untuk memanggil window.print() atau library PDF
    setSnackbar({ open: true, message: 'Mempersiapkan dokumen PDF...', severity: 'info' });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };


  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>

      {/* === 1. KARTU FILTER WALI KELAS === */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tahun Ajaran</InputLabel>
                <Select value={selectedTahun} label="Tahun Ajaran" onChange={(e) => setSelectedTahun(e.target.value)}>
                  <MenuItem value="2024/2025">2024/2025</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={selectedSemester} label="Semester" onChange={(e) => setSelectedSemester(e.target.value)}>
                  <MenuItem value="Ganjil">Ganjil</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" required>
                <InputLabel>Pilih Kelas Anda</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas Anda" onChange={(e) => setSelectedKelas(e.target.value)}>
                  <MenuItem value="10A">10A</MenuItem>
                  <MenuItem value="10B">10B</MenuItem>
                  {/* ...kelas lain... */}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<PageviewIcon />}
              onClick={handleTampilkanSiswa}
              sx={{ minHeight: '40px' }}
            >
              Tampilkan Siswa
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* === 2. TAMPILAN UTAMA (SETELAH FILTER) === */}
      {studentList.length > 0 && (
        <Grid container spacing={3}>

          {/* === KOLOM KIRI: DAFTAR SISWA === */}
          <Grid item xs={12} md={4}>
            <Card>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>Daftar Siswa Kelas {selectedKelas}</Typography>
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto', p: 0 }}>
                {studentList.map(student => (
                  <React.Fragment key={student.id}>
                    <ListItemButton 
                      selected={selectedStudentId === student.id}
                      onClick={() => handleSelectStudent(student.id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: selectedStudentId === student.id ? 'primary.main' : 'grey.400' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={student.nama} secondary={`NIS: ${student.nis}`} />
                    </ListItemButton>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* === KOLOM KANAN: PRATINJAU RAPOR === */}
          <Grid item xs={12} md={8}>
            {reportData && !loadingReport && (
              <Fade in={true}>
                <Card>
                  {/* Header Pratinjau Rapor */}
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={600}>{reportData.info.nama}</Typography>
                        <Typography variant="body1" color="text.secondary">
                          NIS: {reportData.info.nis} | NISN: {reportData.info.nisn}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      startIcon={<PrintIcon />}
                      onClick={handleCetakPDF}
                    >
                      Cetak Rapor (PDF)
                    </Button>
                  </Box>

                  {/* Tabs Rapor */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="tabs rapor">
                      <Tab icon={<SchoolIcon />} iconPosition="start" label="Nilai Akademik" />
                      <Tab icon={<ChecklistIcon />} iconPosition="start" label="Non-Akademik" />
                      <Tab icon={<NoteAltIcon />} iconPosition="start" label="Catatan Wali Kelas" />
                    </Tabs>
                  </Box>

                  {/* --- TAB 1: NILAI AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={0}>
                    <Typography variant="h6" mb={2}>Nilai Akademik (Semester {selectedSemester} {selectedTahun})</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table sx={{ minWidth: '100%' }}>
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                          <TableRow>
                            <TableCell>Mata Pelajaran</TableCell>
                            <TableCell align="center">Nilai Akhir</TableCell>
                            <TableCell align="center">Predikat</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.academic.map((n) => (
                            <TableRow key={n.id} hover>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                {n.mapel}
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>{n.nilai}</TableCell>
                              <TableCell align="center">
                                <Chip label={n.predikat} size="small" color={n.predikat === 'A' ? 'success' : 'info'} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* --- TAB 2: NON-AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>Absensi</Typography>
                        <Stack direction="row" spacing={2} component={Paper} variant="outlined" sx={{ p: 2 }}>
                          <TextField label="Sakit" value={`${reportData.nonAcademic.attendance.sakit} hari`} InputProps={{ readOnly: true }} />
                          <TextField label="Izin" value={`${reportData.nonAcademic.attendance.izin} hari`} InputProps={{ readOnly: true }} />
                          <TextField label="Alpha" value={`${reportData.nonAcademic.attendance.alpha} hari`} InputProps={{ readOnly: true }} />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>Sikap</Typography>
                        <Stack direction="row" spacing={2} component={Paper} variant="outlined" sx={{ p: 2 }}>
                          <TextField label="Spiritual" value={reportData.nonAcademic.sikap.spiritual} InputProps={{ readOnly: true }} fullWidth />
                          <TextField label="Sosial" value={reportData.nonAcademic.sikap.sosial} InputProps={{ readOnly: true }} fullWidth />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Ekstrakurikuler</Typography>
                        <List dense component={Paper} variant="outlined" sx={{ p: 0 }}>
                          {reportData.nonAcademic.extracurricular.map(eks => (
                            <ListItem key={eks.id}>
                              <ListItemText 
                                primary={`${eks.nama} (Nilai: ${eks.nilai})`}
                                secondary={eks.deskripsi}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* --- TAB 3: CATATAN WALI KELAS (BISA EDIT) --- */}
                  <TabPanel value={tabIndex} index={2}>
                    <Typography variant="h6" gutterBottom>Catatan Wali Kelas</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      label="Tuliskan catatan, motivasi, atau masukan untuk siswa..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                    />
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        onClick={handleSimpanCatatan}
                      >
                        Simpan Catatan
                      </Button>
                    </Box>
                  </TabPanel>

                </Card>
              </Fade>
            )}
            {/* Tampilkan placeholder jika belum ada siswa dipilih */}
            {!reportData && !loadingReport && (
              <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Pilih siswa dari daftar di sebelah kiri untuk melihat pratinjau rapor.
                </Typography>
              </Card>
            )}
          </Grid>
          
        </Grid>
      )}

      {/* === SNACKBAR NOTIFIKASI === */}
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

export default HalamanRaporSiswa;
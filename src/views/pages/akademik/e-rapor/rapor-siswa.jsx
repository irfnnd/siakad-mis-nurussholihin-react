import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress
} from '@mui/material';
import PageviewIcon from '@mui/icons-material/Pageview';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SaveIcon from '@mui/icons-material/Save';

// --- IMPORT API ---
import api from '../../../../services/api'; 

// Komponen TabPanel
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
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

// === KOMPONEN UTAMA ===
const HalamanRaporSiswa = () => {
  
  // === USER INFO ===
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  // === STATE FILTER ===
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedKelas, setSelectedKelas] = useState(''); 

  // === STATE DATA MASTER ===
  const [kelasOptions, setKelasOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // === STATE DATA UTAMA ===
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState(null); // Data rapor lengkap untuk UI
  const [raporId, setRaporId] = useState(null); // ID Rapor dari database (untuk update)

  // === UI STATE ===
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [catatan, setCatatan] = useState(''); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // === 1. FETCH DATA MASTER ===
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resKelas, resTahun, resSem] = await Promise.all([
          api.get('/kelas'),
          api.get('/tahun-ajaran'),
          api.get('/semester')
        ]);

        // Kelas
        const dataKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        let processedKelasOptions = Array.isArray(dataKelas) ? dataKelas : [];
        
        // Filter Wali Kelas
        if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
             const myClass = processedKelasOptions.find(k => String(k.wali_kelas_id) === String(currentUser.pegawai.id));
             if (myClass) {
                 processedKelasOptions = [myClass];
                 setSelectedKelas(myClass.id);
             }
        }
        setKelasOptions(processedKelasOptions);

        // Tahun Ajaran
        const dataTahun = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
        setTahunOptions(Array.isArray(dataTahun) ? dataTahun : []);
        const activeTahun = Array.isArray(dataTahun) ? dataTahun.find(t => t.status === 'Aktif') : null;
        if (activeTahun && !selectedTahun) setSelectedTahun(activeTahun.tahun);

        // Semester
        const dataSem = resSem.data?.data?.semester || resSem.data?.data || [];
        setSemesterOptions(Array.isArray(dataSem) ? dataSem : []);
        const activeSem = Array.isArray(dataSem) ? dataSem.find(s => s.status === 'Aktif') : null;
        if (activeSem && !selectedSemester) setSelectedSemester(activeSem.id);

      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    
    // Fetch hanya jika currentUser sudah ada (untuk logika wali kelas)
    if (currentUser) {
        fetchMasterData();
    }
  }, [currentUser]); 

  // === 2. FETCH DAFTAR SISWA ===
  const handleTampilkanSiswa = async () => {
    if (!selectedKelas) {
      setSnackbar({ open: true, message: 'Silakan pilih kelas Anda.', severity: 'warning' });
      return;
    }
    setLoading(true);
    setReportData(null);
    setSelectedStudentId('');
    
    try {
      const response = await api.get('/siswa', { params: { kelas_id: selectedKelas, limit: 1000 } });
      const dataSiswa = response.data?.data?.siswa || [];
      
      setStudentList(Array.isArray(dataSiswa) ? dataSiswa.map(s => ({
          id: s.id,
          nis: s.nis,
          nisn: s.nisn,
          nama: s.nama_lengkap || s.nama
      })) : []);

      setSnackbar({ open: true, message: `Daftar siswa dimuat.`, severity: 'success' });
    } catch (error) {
      console.error("Error fetching siswa:", error);
      setSnackbar({ open: true, message: 'Gagal memuat daftar siswa.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === 3. FETCH DETAIL RAPOR SISWA ===
  const handleSelectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setLoadingReport(true);
    setTabIndex(0);

    try {
      // A. Ambil Rapor (Nilai Mapel, Ekskul, Sikap)
      const resRapor = await api.get('/rapor', {
        params: {
            siswa_id: studentId,
            semester_id: selectedSemester,
            limit: 1
        }
      });
      
      // --- EXTRAKSI DATA RAPOR (AMANA) ---
      const responseData = resRapor.data?.data;
      let raporList = [];

      if (responseData?.rapor && Array.isArray(responseData.rapor)) {
        raporList = responseData.rapor;
      } else if (Array.isArray(responseData)) {
        raporList = responseData;
      } else if (responseData) {
        // Jika object tunggal
        raporList = [responseData];
      }

      const raporRaw = raporList.length > 0 ? raporList[0] : null;
      console.log("Data Rapor Raw (Debug):", raporRaw); // Cek console browser untuk melihat isi detail

      // B. Ambil Absensi (Hitung S, I, A dari endpoint harian)
      let sakit = 0, izin = 0, alpha = 0;
      try {
        const resAbsensi = await api.get('/absensi-harian', {
            params: {
                siswa_id: studentId,
                semester_id: selectedSemester,
                limit: 1000 
            }
        });
        const absensiList = resAbsensi.data?.data?.absensi_harian || [];
        absensiList.forEach(a => {
            if (a.status === 'S') sakit++;
            else if (a.status === 'I') izin++;
            else if (a.status === 'A') alpha++;
        });
      } catch (err) {
        console.warn("Gagal ambil data absensi harian", err);
      }

      // --- MAPPING DATA KE UI ---
      const studentInfo = studentList.find(s => s.id === studentId);
      
      if (raporRaw) {
          setRaporId(raporRaw.id);
          setCatatan(raporRaw.catatan_wali_kelas || '');

          // --- PERBAIKAN: Ambil nilai dari key 'nilai_mapel' (default) atau fallback ---
          const nilaiList = raporRaw.nilai_mapel || raporRaw.nilai_rapor || [];
          console.log("List Nilai Mapel:", nilaiList); // Cek apakah array ini kosong?

          setReportData({
              info: { 
                  nama: studentInfo?.nama, 
                  nis: studentInfo?.nis, 
                  nisn: studentInfo?.nisn 
              },
              academic: nilaiList.map(nm => ({
                  id: nm.id,
                  // Ambil nama mapel dari relasi 'mapel' (alias umum) atau 'mata_pelajaran'
                  mapel: nm.mapel?.nama_mapel || nm.mata_pelajaran?.nama_mapel || 'Mapel Tidak Diketahui',
                  
                  // Nilai Pengetahuan (P)
                  nilai: nm.nilai_pengetahuan, 
                  predikat: nm.predikat_pengetahuan,
                  
                  // Nilai Keterampilan (K)
                  nilai_k: nm.nilai_keterampilan,
                  predikat_k: nm.predikat_keterampilan
              })),
              nonAcademic: {
                  attendance: { sakit, izin, alpha },
                  extracurricular: (raporRaw.nilai_ekskul || raporRaw.nilai_ekskul_siswa || []).map(ne => ({
                      id: ne.id,
                      nama: ne.ekskul?.nama_ekskul || 'Ekskul',
                      nilai: ne.nilai,
                      deskripsi: ne.deskripsi
                  })),
                  sikap: {
                      spiritual: raporRaw.sikap_spiritual_predikat || '-',
                      sosial: raporRaw.sikap_sosial_predikat || '-'
                  }
              }
          });
      } else {
          // Jika Rapor Belum Ada
          setRaporId(null);
          setCatatan('');
          setReportData({
              info: { 
                  nama: studentInfo?.nama, 
                  nis: studentInfo?.nis, 
                  nisn: studentInfo?.nisn 
              },
              academic: [], 
              nonAcademic: {
                  attendance: { sakit, izin, alpha },
                  extracurricular: [],
                  sikap: { spiritual: '-', sosial: '-' }
              }
          });
      }

    } catch (error) {
        console.error("Error fetching report details:", error);
        setSnackbar({ open: true, message: 'Gagal memuat detail rapor.', severity: 'error' });
    } finally {
        setLoadingReport(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // === 4. SIMPAN CATATAN WALI KELAS ===
  const handleSimpanCatatan = async () => {
    if (!raporId) {
        setSnackbar({ open: true, message: 'Rapor belum dibuat. Harap generate nilai terlebih dahulu (oleh Admin/System).', severity: 'warning' });
        return;
    }

    try {
        await api.put(`/rapor/${raporId}`, {
            catatan_wali_kelas: catatan
        });
        setSnackbar({ open: true, message: 'Catatan wali kelas berhasil disimpan.', severity: 'success' });
    } catch (error) {
        console.error("Error saving note:", error);
        setSnackbar({ open: true, message: 'Gagal menyimpan catatan.', severity: 'error' });
    }
  };

  const handleCetakPDF = () => {
    setSnackbar({ open: true, message: 'Fitur cetak PDF akan segera hadir...', severity: 'info' });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 1.5, md: 2 } }}>
      
      {/* FILTER CARD */}
      <Card sx={{ mb: { xs: 1.5, sm: 2, md: 2 }, p: { xs: 2, sm: 1.5, md: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">
            {/* Tahun Ajaran */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tahun Ajaran</InputLabel>
                <Select value={selectedTahun} label="Tahun Ajaran" onChange={(e) => setSelectedTahun(e.target.value)}>
                   {tahunOptions.map(t => <MenuItem key={t.id} value={t.tahun}>{t.tahun}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Semester */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={selectedSemester} label="Semester" onChange={(e) => setSelectedSemester(e.target.value)}>
                   {semesterOptions.map(s => <MenuItem key={s.id} value={s.id}>{s.nama}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Kelas */}
            <Grid item xs={12} sm={6} md={3}>
              {currentUser?.role === 'Guru' && kelasOptions.length === 1 ? (
                   <TextField
                       label="Kelas Perwalian"
                       size="small"
                       fullWidth
                       value={kelasOptions[0].nama_kelas}
                       InputProps={{ readOnly: true }}
                   />
              ) : (
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Pilih Kelas</InputLabel>
                    <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                        {kelasOptions.map(k => <MenuItem key={k.id} value={k.id}>{k.nama_kelas}</MenuItem>)}
                    </Select>
                  </FormControl>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={3} >
                <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkanSiswa} sx={{ minHeight: '40px' }}>
                 {loading ? 'Memuat...' : 'Tampilkan'}
                </Button>
            </Grid>
        </Grid>
      </Card>

      {/* DATA TAMPILAN */}
      {studentList.length > 0 && (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          
          {/* LIST SISWA */}
          <Grid item xs={12} md={4}>
            <Card>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                  Daftar Siswa ({studentList.length})
                </Typography>
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto', p: 0 }}>
                {studentList.map((student) => (
                  <React.Fragment key={student.id}>
                    <ListItemButton selected={selectedStudentId === student.id} onClick={() => handleSelectStudent(student.id)}>
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

          {/* DETAIL RAPOR */}
          <Grid item xs={12} md={8}>
            {loadingReport ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : reportData ? (
              <Fade in={true}>
                <Card>
                  {/* Header Rapor */}
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
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handleCetakPDF} disabled={!raporId}>
                      Cetak PDF
                    </Button>
                  </Box>

                  {/* Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant='scrollable' scrollButtons="auto" aria-label="tabs rapor">
                      <Tab icon={<SchoolIcon />} iconPosition="start" label="Nilai Akademik" />
                      <Tab icon={<ChecklistIcon />} iconPosition="start" label="Non-Akademik" />
                      <Tab icon={<NoteAltIcon />} iconPosition="start" label="Catatan Wali Kelas" />
                    </Tabs>
                  </Box>

                  {/* --- TAB 1: NILAI AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={0}>
                    {reportData.academic.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell>Mata Pelajaran</TableCell>
                                <TableCell align="center">Nilai (P)</TableCell>
                                <TableCell align="center">Predikat (P)</TableCell>
                                <TableCell align="center">Nilai (K)</TableCell>
                                <TableCell align="center">Predikat (K)</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {reportData.academic.map((n) => (
                                <TableRow key={n.id} hover>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                    {n.mapel}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    {n.nilai || '-'}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={n.predikat || '-'} size="small" color={n.predikat === 'A' ? 'success' : 'default'} variant="outlined" />
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    {n.nilai_k || '-'}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={n.predikat_k || '-'} size="small" color={n.predikat_k === 'A' ? 'success' : 'default'} variant="outlined" />
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">Belum ada nilai akademik yang tersimpan di Rapor. Silakan "Simpan ke Rapor" dari menu Input Nilai.</Alert>
                    )}
                  </TabPanel>

                  {/* --- TAB 2: NON-AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Absensi (Semester Ini)</Typography>
                        <Stack direction="row" spacing={2} component={Paper} variant="outlined" sx={{ p: 2 }}>
                          <TextField label="Sakit" value={`${reportData.nonAcademic.attendance.sakit} hari`} InputProps={{ readOnly: true }} />
                          <TextField label="Izin" value={`${reportData.nonAcademic.attendance.izin} hari`} InputProps={{ readOnly: true }} />
                          <TextField label="Alpha" value={`${reportData.nonAcademic.attendance.alpha} hari`} InputProps={{ readOnly: true }} />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Sikap</Typography>
                        <Stack direction="row" spacing={2} component={Paper} variant="outlined" sx={{ p: 2 }}>
                          <TextField label="Spiritual" value={reportData.nonAcademic.sikap.spiritual || '-'} InputProps={{ readOnly: true }} fullWidth />
                          <TextField label="Sosial" value={reportData.nonAcademic.sikap.sosial || '-'} InputProps={{ readOnly: true }} fullWidth />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Ekstrakurikuler</Typography>
                        {reportData.nonAcademic.extracurricular.length > 0 ? (
                            <List dense component={Paper} variant="outlined" sx={{ p: 0 }}>
                            {reportData.nonAcademic.extracurricular.map((eks) => (
                                <ListItem key={eks.id} divider>
                                <ListItemText 
                                    primary={`${eks.nama} (Nilai: ${eks.nilai})`} 
                                    secondary={eks.deskripsi || '-'} 
                                />
                                </ListItem>
                            ))}
                            </List>
                        ) : <Typography variant="body2" color="text.secondary">Tidak ada data ekskul.</Typography>}
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* --- TAB 3: CATATAN --- */}
                  <TabPanel value={tabIndex} index={2}>
                    <Typography variant="h6" gutterBottom>Catatan Wali Kelas</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder="Tuliskan catatan..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      disabled={!raporId}
                      helperText={!raporId ? "Generate nilai terlebih dahulu." : ""}
                    />
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanCatatan} disabled={!raporId}>
                        Simpan Catatan
                      </Button>
                    </Box>
                  </TabPanel>

                </Card>
              </Fade>
            ) : (
              <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Pilih siswa dari daftar untuk melihat pratinjau rapor.
                </Typography>
              </Card>
            )}
          </Grid>
          
        </Grid>
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

export default HalamanRaporSiswa;
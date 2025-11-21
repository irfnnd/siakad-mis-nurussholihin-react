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
  TextField,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';

// --- IMPORT EXCELJS & FILE-SAVER ---
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- DATA MOCKUP ---
const mockGuru = [
  { id: 1, nama: 'Budi Santoso, S.Pd.SD', role: 'Guru Kelas' },
  { id: 2, nama: 'Siti Aminah, S.Pd.I', role: 'Guru PAI' },
  { id: 3, nama: 'Rina Marlina, S.Pd.', role: 'Guru PJOK' },
  { id: 4, nama: 'Ahmad, S.Pd.', role: 'Guru B. Inggris' },
  { id: 5, nama: 'Dewi Lestari, S.Pd.SD', role: 'Guru Kelas' },
];

const waliKelasMap = {
  '1A': 'Budi Santoso, S.Pd.SD',
  '1B': 'Dewi Lestari, S.Pd.SD',
  '2A': 'Budi Santoso, S.Pd.SD',
  '3A': 'Dewi Lestari, S.Pd.SD',
  '4A': 'Budi Santoso, S.Pd.SD',
  '5A': 'Dewi Lestari, S.Pd.SD',
  '6A': 'Budi Santoso, S.Pd.SD',
};

const mockMapel = [
  { nama: 'Tematik', tipe: 'Guru Kelas' },
  { nama: 'Matematika', tipe: 'Guru Kelas' },
  { nama: 'IPAS', tipe: 'Guru Kelas' },
  { nama: 'Pendidikan Pancasila', tipe: 'Guru Kelas' },
  { nama: 'Seni Budaya', tipe: 'Guru Kelas' },
  { nama: 'Pendidikan Agama Islam', tipe: 'Guru Mapel' },
  { nama: 'PJOK', tipe: 'Guru Mapel' },
  { nama: 'Bahasa Inggris (Mulok)', tipe: 'Guru Mapel' },
];

// Data awal dummy
const initialSchedule = [
  { id: 1, kelas: '4A', hari: 'Senin', jamMulai: '07:00', jamSelesai: '07:35', mapel: 'Upacara Bendera', guru: '-' },
  { id: 2, kelas: '4A', hari: 'Senin', jamMulai: '07:35', jamSelesai: '08:45', mapel: 'Tematik', guru: 'Budi Santoso, S.Pd.SD' },
  { id: 3, kelas: '4A', hari: 'Selasa', jamMulai: '07:00', jamSelesai: '08:10', mapel: 'PJOK', guru: 'Rina Marlina, S.Pd.' },
  { id: 4, kelas: '4A', hari: 'Rabu', jamMulai: '07:00', jamSelesai: '08:10', mapel: 'Matematika', guru: 'Budi Santoso, S.Pd.SD' },
];

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// --- KOMPONEN UTAMA ---
const JadwalPelajaran = () => {
  const [jadwalList, setJadwalList] = useState(initialSchedule);
  const [loading, setLoading] = useState(false);
  
  const [selectedKelas, setSelectedKelas] = useState('4A');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2024/2025');

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null, kelas: '', hari: '', jamMulai: '07:00', jamSelesai: '07:35', mapel: '', guru: ''
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- HELPER: Transform Data ke Tabel ---
  const tableRows = useMemo(() => {
    const filtered = jadwalList.filter(item => item.kelas === selectedKelas);
    const uniqueTimes = [...new Set(filtered.map(item => `${item.jamMulai} - ${item.jamSelesai}`))].sort();

    return uniqueTimes.map(time => {
      const [start, end] = time.split(' - ');
      const rowData = { time };
      days.forEach(day => {
        const entry = filtered.find(item => item.hari === day && item.jamMulai === start);
        rowData[day.toLowerCase()] = entry || null;
      });
      return rowData;
    });
  }, [jadwalList, selectedKelas]);

  // --- FUNGSI EXPORT EXCEL (MENGGUNAKAN EXCELJS) ---
  const handleExport = async () => {
    // 1. Buat Workbook dan Worksheet baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Jadwal ${selectedKelas}`);

    // 2. Definisi Kolom
    worksheet.columns = [
      { header: 'Waktu', key: 'time', width: 15 },
      { header: 'Senin', key: 'senin', width: 30 },
      { header: 'Selasa', key: 'selasa', width: 30 },
      { header: 'Rabu', key: 'rabu', width: 30 },
      { header: 'Kamis', key: 'kamis', width: 30 },
      { header: 'Jumat', key: 'jumat', width: 30 },
      { header: 'Sabtu', key: 'sabtu', width: 30 },
    ];

    // 3. Masukkan Data Baris
    tableRows.forEach((row) => {
      const rowData = { time: row.time };
      
      days.forEach((day) => {
        const entry = row[day.toLowerCase()];
        if (entry) {
          if (entry.mapel === 'Istirahat') {
            rowData[day.toLowerCase()] = 'ISTIRAHAT';
          } else {
            // Gunakan format teks dengan enter (\n) agar rapi
            rowData[day.toLowerCase()] = `${entry.mapel}\n(${entry.guru})`;
          }
        } else {
          rowData[day.toLowerCase()] = '';
        }
      });

      worksheet.addRow(rowData);
    });

    // 4. Styling Excel (Agar terlihat profesional)
    
    // Style Header (Baris 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' } // Warna Biru Primary
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Style Isi Tabel (Mulai Baris 2)
    worksheet.eachRow((row, rowNumber) => {
      // Atur tinggi baris agar teks wrap terlihat
      row.height = 45; 
      
      row.eachCell((cell) => {
        // Border untuk semua sel
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Alignment (Tengah & Wrap Text)
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center', 
          wrapText: true 
        };

        // Khusus kolom Istirahat (Jika ada teks ISTIRAHAT)
        if (cell.value === 'ISTIRAHAT') {
           cell.fill = {
             type: 'pattern',
             pattern: 'solid',
             fgColor: { argb: 'FFFFEB3B' } // Kuning
           };
           cell.font = { bold: true };
        }
      });
    });

    // 5. Generate Buffer & Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Jadwal_Pelajaran_Kelas_${selectedKelas}.xlsx`);
  };

  // --- HANDLERS LAIN ---
  const handleMapelChange = (mapelNama) => {
    const mapelInfo = mockMapel.find(m => m.nama === mapelNama);
    let guruOtomatis = '';

    if (mapelNama === 'Istirahat' || mapelNama === 'Upacara Bendera') {
        guruOtomatis = '-';
    } else if (mapelInfo?.tipe === 'Guru Kelas') {
        guruOtomatis = waliKelasMap[formData.kelas] || ''; 
    }

    setFormData(prev => ({
        ...prev,
        mapel: mapelNama,
        guru: guruOtomatis
    }));
  };

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      kelas: selectedKelas,
      hari: 'Senin',
      jamMulai: '07:00',
      jamSelesai: '07:35',
      mapel: '',
      guru: ''
    });
    setOpenFormDialog(true);
  };

  const handleOpenEditDialog = (entry) => {
    setIsEditMode(true);
    setFormData(entry);
    setOpenFormDialog(true);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const newData = { ...formData, id: isEditMode ? formData.id : Date.now() };

    setTimeout(() => {
      if (isEditMode) {
        setJadwalList(prev => prev.map(item => item.id === newData.id ? newData : item));
        setSnackbar({ open: true, message: 'Jadwal diperbarui', severity: 'success' });
      } else {
        setJadwalList(prev => [...prev, newData]);
        setSnackbar({ open: true, message: 'Jadwal ditambahkan', severity: 'success' });
      }
      setLoading(false);
      setOpenFormDialog(false);
    }, 500);
  };

  const handleConfirmDelete = () => {
    setJadwalList(prev => prev.filter(item => item.id !== formData.id));
    setOpenConfirmDialog(false);
    setSnackbar({ open: true, message: 'Jadwal dihapus', severity: 'success' });
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* HEADER & FILTER */}
      <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          
          {/* Menggunakan size={{ xs: ..., md: ... }} */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Pilih Kelas</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                  {Object.keys(waliKelasMap).map(kelas => (
                    <MenuItem key={kelas} value={kelas}>Kelas {kelas}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Tahun Ajaran</InputLabel>
                <Select value={selectedTahunAjaran} label="Tahun Ajaran" onChange={(e) => setSelectedTahunAjaran(e.target.value)}>
                  <MenuItem value="2024/2025">2024/2025</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          
          {/* TOMBOL AKSI */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    onClick={handleExport}
                >
                  Export Excel
                </Button>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenAddDialog}
                >
                  Tambah Jadwal
                </Button>
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
           Wali Kelas <strong>{selectedKelas}</strong> saat ini: {waliKelasMap[selectedKelas]}
        </Typography>
      </Card>

      {/* TABEL JADWAL */}
      <Card>
        <TableContainer component={Paper} sx={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: 150 }}>Waktu</TableCell>
                {days.map(day => (
                  <TableCell key={day} sx={{ fontWeight: 'bold', textAlign: 'center', width: 150 }}>{day}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.length > 0 ? tableRows.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell align="center" sx={{ fontWeight: 500, bgcolor: 'grey.50' }}>{row.time}</TableCell>
                  {days.map(day => {
                    const entry = row[day.toLowerCase()];
                    if (entry?.mapel === 'Istirahat') {
                        return <TableCell key={day} sx={{ bgcolor: 'warning.lighter', textAlign:'center', fontWeight:'bold', color:'warning.dark' }}>ISTIRAHAT</TableCell>;
                    }
                    return (
                      <TableCell key={day} sx={{ verticalAlign: 'top', height: 50, p: 1 }}>
                        {entry ? (
                          <Card variant="outlined" sx={{ height: '100%', bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main', p: 1, position: 'relative', '&:hover .action-buttons': { display: 'flex' } }}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary.dark" sx={{ fontSize: '0.85rem' }}>{entry.mapel}</Typography>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                {entry.guru === waliKelasMap[selectedKelas] ? 'Wali Kelas' : entry.guru}
                            </Typography>
                            <Stack className="action-buttons" direction="row" spacing={0.5} sx={{ display: 'none', position: 'absolute', bottom: 4, right: 4, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
                              <IconButton size="small" onClick={() => handleOpenEditDialog(entry)}><EditIcon fontSize="inherit" color="primary" /></IconButton>
                              <IconButton size="small" onClick={() => { setFormData(entry); setOpenConfirmDialog(true); }}><DeleteIcon fontSize="inherit" color="error" /></IconButton>
                            </Stack>
                          </Card>
                        ) : <Box sx={{ height: '100%', bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300', borderRadius: 1 }} />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>Belum ada jadwal.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon /> {isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField label="Kelas" fullWidth size="small" value={formData.kelas} disabled />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Hari</InputLabel>
                  <Select value={formData.hari} label="Hari" onChange={(e) => setFormData({ ...formData, hari: e.target.value })}>
                    {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField label="Jam Mulai" type="time" fullWidth required size="small" InputLabelProps={{ shrink: true }} value={formData.jamMulai} onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6, md:3 }}>
                <TextField label="Jam Selesai" type="time" fullWidth required size="small" InputLabelProps={{ shrink: true }} value={formData.jamSelesai} onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md:6 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Mata Pelajaran</InputLabel>
                  <Select value={formData.mapel} label="Mata Pelajaran" onChange={(e) => handleMapelChange(e.target.value)}>
                     {mockMapel.map(m => <MenuItem key={m.nama} value={m.nama}>{m.nama}</MenuItem>)}
                     <MenuItem value="Upacara Bendera" sx={{ color: 'info.main' }}>Upacara Bendera</MenuItem>
                     <MenuItem value="Istirahat" sx={{ color: 'warning.main', fontWeight: 'bold' }}>Istirahat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md:6 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Guru Pengajar</InputLabel>
                  <Select value={formData.guru} label="Guru Pengajar" onChange={(e) => setFormData({ ...formData, guru: e.target.value })}>
                    <MenuItem value="-">-</MenuItem>
                    <MenuItem value={waliKelasMap[formData.kelas]} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>{waliKelasMap[formData.kelas]} (Wali Kelas)</MenuItem>
                    <MenuItem disabled>────────────────</MenuItem>
                    {mockGuru.map(g => <MenuItem key={g.id} value={g.nama}>{g.nama} ({g.role})</MenuItem>)}
                  </Select>
                  <FormHelperText>Otomatis terisi Wali Kelas untuk Mapel Umum</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenFormDialog(false)}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Simpan'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Hapus Jadwal?</DialogTitle>
        <DialogContent><Typography>Hapus <b>{formData.mapel}</b> di hari <b>{formData.hari}</b>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default JadwalPelajaran;
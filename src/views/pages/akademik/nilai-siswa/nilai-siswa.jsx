import React, { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PageviewIcon from '@mui/icons-material/Pageview';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';

// === HELPER FUNCTION ===
const getAverage = (arr) => {
  const valid = arr.filter((n) => typeof n === 'number' && !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
};

const getPredikat = (nilai) => {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
};

// === MOCK DATA (SD Workflow) ===

// Daftar Siswa (Konstan untuk kelas ini)
const mockStudents = [
  { id: 'S-001', nis: '102030', nama: 'Budi Santoso' },
  { id: 'S-002', nis: '102031', nama: 'Ani Yudhoyono' },
  { id: 'S-003', nis: '102032', nama: 'Charlie van Houten' },
  { id: 'S-004', nis: '102033', nama: 'Dewi Lestari' }
];

// Data untuk Mapel MATEMATIKA
const mockDataMatematika = {
  assignments: [
    { id: 'MTK-A-01', nama: 'Tugas 1 (MTK)', tipe: 'Harian' },
    { id: 'MTK-A-02', nama: 'UH 1 (MTK)', tipe: 'Harian' },
    { id: 'MTK-PTS-01', nama: 'PTS', tipe: 'PTS' },
    { id: 'MTK-PAS-01', nama: 'PAS', tipe: 'PAS' }
  ],
  grades: [
    { studentId: 'S-001', assignmentId: 'MTK-A-01', nilai: 80 },
    { studentId: 'S-001', assignmentId: 'MTK-A-02', nilai: 90 },
    { studentId: 'S-001', assignmentId: 'MTK-PTS-01', nilai: 85 },
    { studentId: 'S-001', assignmentId: 'MTK-PAS-01', nilai: 88 },
    { studentId: 'S-002', assignmentId: 'MTK-A-01', nilai: 90 },
    { studentId: 'S-002', assignmentId: 'MTK-PTS-01', nilai: 92 },
  ],
  bobot: { harian: 40, pts: 30, pas: 30 }
};

// Data untuk Mapel IPA (berbeda)
const mockDataIPA = {
  assignments: [
    { id: 'IPA-A-01', nama: 'Proyek 1 (IPA)', tipe: 'Harian' },
    { id: 'IPA-A-02', nama: 'UH 1 (IPA)', tipe: 'Harian' },
    { id: 'IPA-PTS-01', nama: 'PTS', tipe: 'PTS' },
    { id: 'IPA-PAS-01', nama: 'PAS', tipe: 'PAS' }
  ],
  grades: [
    { studentId: 'S-001', assignmentId: 'IPA-A-01', nilai: 88 },
    { studentId: 'S-002', assignmentId: 'IPA-A-01', nilai: 95 },
    { studentId: 'S-003', assignmentId: 'IPA-A-02', nilai: 78 },
    { studentId: 'S-003', assignmentId: 'IPA-PTS-01', nilai: 80 },
  ],
  bobot: { harian: 50, pts: 25, pas: 25 } // Bobot IPA berbeda
};


// === KOMPONEN UTAMA ===
const HalamanNilaiSiswa = () => { // Ganti nama komponen
  
  // === SIMULASI KONTEKS GURU KELAS (SD) ===
  // Di aplikasi nyata, ini akan datang dari state login (Auth Context)
  const waliKelasInfo = {
    kelasId: '4A',
    namaKelas: 'Kelas 4A'
  };

  // === STATE ===
  const [selectedTahun, setSelectedTahun] = useState('2024/2025');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  // 'selectedKelas' DIHAPUS, diganti dengan 'waliKelasInfo'
  const [selectedMapel, setSelectedMapel] = useState(''); // Ini filter utama

  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [bobot, setBobot] = useState({ harian: 0, pts: 0, pas: 0 });

  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const totalBobot = bobot.harian + bobot.pts + bobot.pas;
  const bobotError = totalBobot !== 100;

  // === HANDLER ===
  const handleTampilkan = () => {
    // Validasi diubah: hanya cek mapel
    if (!selectedMapel) {
      setSnackbar({ open: true, message: 'Silakan pilih Mata Pelajaran.', severity: 'warning' });
      return;
    }
    setLoading(true);

    // Logika baru: Muat data berdasarkan mapel yang dipilih
    let dataToLoad;
    if (selectedMapel === 'Matematika') {
      dataToLoad = mockDataMatematika;
    } else if (selectedMapel === 'IPA') {
      dataToLoad = mockDataIPA;
    } else {
      // Fallback jika mapel lain dipilih (data kosong)
      dataToLoad = { assignments: [], grades: [], bobot: { harian: 40, pts: 30, pas: 30 } };
    }

    setTimeout(() => {
      setStudents(mockStudents); // Daftar siswa selalu sama untuk kelas ini
      setAssignments(dataToLoad.assignments);
      setGrades(dataToLoad.grades);
      setBobot(dataToLoad.bobot);
      setLoading(false);
      // Pesan snackbar diubah
      setSnackbar({ open: true, message: `Buku nilai ${selectedMapel} kelas ${waliKelasInfo.namaKelas} dimuat.`, severity: 'success' });
    }, 1000);
  };

  const handleSimpanBobot = () => {
    if (bobotError) {
      setSnackbar({ open: true, message: 'Total bobot harus 100%.', severity: 'error' });
      return;
    }
    // API save...
    setSnackbar({ open: true, message: `Bobot ${selectedMapel} berhasil disimpan.`, severity: 'success' });
  };

  // Handler lain (tidak perlu diubah)
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleSaveNewAssignment = () => {
    if (!newAssignmentName.trim()) return;
    const newAssign = { id: `A-${Date.now()}`, nama: newAssignmentName, tipe: 'Harian' };
    setAssignments((prev) => [...prev, newAssign]);
    setSnackbar({ open: true, message: `Kolom '${newAssignmentName}' ditambahkan.`, severity: 'success' });
    setNewAssignmentName('');
    handleCloseAddDialog();
  };

  const processRowUpdate = (newRow, oldRow) => {
    assignments.forEach((assign) => {
      const fieldId = assign.id;
      let newValue = parseFloat(newRow[fieldId]);
      if (isNaN(newValue) || newValue < 0 || newValue > 100) newValue = null;

      const oldValue = oldRow[fieldId];
      if (newValue !== oldValue) {
        setGrades((prev) => {
          const idx = prev.findIndex((g) => g.studentId === newRow.id && g.assignmentId === fieldId);
          if (idx > -1) {
            const updated = [...prev];
            if (newValue === null) updated.splice(idx, 1);
            else updated[idx] = { ...updated[idx], nilai: newValue };
            return updated;
          } else if (newValue !== null) {
            return [...prev, { studentId: newRow.id, assignmentId: fieldId, nilai: newValue }];
          }
          return prev;
        });
      }
    });
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error(error);
    setSnackbar({ open: true, message: 'Gagal menyimpan nilai.', severity: 'error' });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // === DATAGRID SETUP ===
  // Logika ini tidak perlu diubah, akan bekerja dengan state yang baru
  const columns = useMemo(() => {
    if (!assignments?.length) return [];

    const staticCols = [
      { field: 'nis', headerName: 'NIS', width: 100, editable: false, cellClassName: 'static-cell' },
      { field: 'nama', headerName: 'Nama Siswa', flex: 1, minWidth: 200, editable: false, cellClassName: 'static-cell' }
    ];

    const dynamicCols = assignments.map((a) => ({
      field: a.id,
      headerName: a.nama,
      width: 110,
      type: 'number',
      editable: true,
      cellClassName: a.tipe === 'Harian' ? 'daily-cell' : 'exam-cell'
    }));

    const calcCols = [
      {
        field: 'avgHarian',
        headerName: 'Rata2 Harian',
        width: 110,
        type: 'number',
        editable: false,
        cellClassName: 'calculated-cell',
        valueGetter: (p) => {
          if (!p?.row) return null;
          const ids = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id);
          const avg = getAverage(ids.map((id) => p.row?.[id] ?? null));
          return avg > 0 ? Math.round(avg) : null;
        }
      },
      {
        field: 'nilaiAkhir',
        headerName: 'Nilai Akhir',
        width: 110,
        type: 'number',
        editable: false,
        cellClassName: 'calculated-cell final-grade',
        valueGetter: (p) => {
          if (!p?.row) return null;
          // Gunakan 'getCellValue' untuk mengambil nilai dari kolom kalkulasi 'avgHarian'
          const avgHarian = p.api.getCellValue(p.id, 'avgHarian') || 0;
          
          const ptsId = assignments.find((a) => a.tipe === 'PTS')?.id;
          const pasId = assignments.find((a) => a.tipe === 'PAS')?.id;
          const nilaiPts = ptsId ? (p.row?.[ptsId] ?? 0) : 0;
          const nilaiPas = pasId ? (p.row?.[pasId] ?? 0) : 0;

          const final = (avgHarian * bobot.harian) / 100 + (nilaiPts * bobot.pts) / 100 + (nilaiPas * bobot.pas) / 100;
          return final > 0 ? Math.round(final) : null;
        }
      },
      {
        field: 'predikat',
        headerName: 'Predikat',
        width: 90,
        editable: false,
        cellClassName: 'calculated-cell',
        valueGetter: (p) => {
          if (!p?.row) return '-';
          const nilaiAkhir = p.api.getCellValue(p.id, 'nilaiAkhir');
          return nilaiAkhir ? getPredikat(nilaiAkhir) : '-';
        }
      }
    ];

    return [...staticCols, ...dynamicCols, ...calcCols];
  }, [assignments, bobot]); // 'bobot' adalah dependensi penting

  const rows = useMemo(() => {
    return students.map((s) => {
      const row = { id: s.id, nis: s.nis, nama: s.nama };
      assignments.forEach((a) => {
        const g = grades.find((gr) => gr.studentId === s.id && gr.assignmentId === a.id);
        row[a.id] = g ? g.nilai : null;
      });
      return row;
    });
  }, [students, assignments, grades]);

// === RENDER ===
return (
  <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
    
    {/* === FILTER (SD Workflow) === */}
    <Card sx={{ mb: 1, p: 2 }}>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
        
        <Grid item size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tahun Ajaran</InputLabel>
            <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} label="Tahun Ajaran">
              <MenuItem value="2024/2025">2024/2025</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 6, sm: 4, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Semester</InputLabel>
            <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
              <MenuItem value="Ganjil">Ganjil</MenuItem>
              <MenuItem value="Genap">Genap</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item size={{ xs: 12, sm: 4, md: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.darker', textAlign: 'center' }}
          >
            <strong>Wali Kelas: {waliKelasInfo.namaKelas}</strong>
          </Typography>
        </Grid>
        
        <Grid item size={{ xs: 7, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Mata Pelajaran</InputLabel>
            <Select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} label="Mata Pelajaran">
              <MenuItem value="Matematika">Matematika</MenuItem>
              <MenuItem value="IPA">IPA</MenuItem>
              <MenuItem value="Bahasa Indonesia">Bahasa Indonesia</MenuItem>
              <MenuItem value="IPS">IPS</MenuItem>
              <MenuItem value="PPKn">PPKn</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item size={{ xs: 5, sm: 6, md: 2 }}>
          <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan}>
            Tampilkan
          </Button>
        </Grid>

      </Grid>
    </Card>

    {/* === DATA TAMPILAN === */}
    {students.length > 0 && (
      <Fade in>
        <Box>
          {/* === KONFIGURASI BOBOT === */}
          <Card sx={{ mb: 1, p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom>
              Konfigurasi Bobot: {selectedMapel}
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              {['harian', 'pts', 'pas'].map((key) => (
                <Grid item size={{ xs: 4, sm: 4, md: 2 }} key={key}>
                  <TextField
                    label={`Bobot ${key.toUpperCase()}`}
                    type="number"
                    size="small"
                    fullWidth
                    value={bobot[key]}
                    onChange={(e) => setBobot((b) => ({ ...b, [key]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
              ))}
              <Grid item size={{ xs: 7, sm: 6, md: 3 }}>
                <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanBobot} disabled={bobotError}>
                  Simpan Bobot
                </Button>
              </Grid>
              <Grid item size={{ xs: 5, sm: 6, md: 3 }}>
                <Typography 
                  variant="subtitle2"
                  color={bobotError ? 'error.main' : 'success.main'}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                >
                  {bobotError && <WarningIcon fontSize="small" sx={{ mr: 1 }} />}
                  Total Bobot: {totalBobot}% {bobotError && '(harus 100%)'}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* === TABEL NILAI === */}
          <Card>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Buku Nilai: {selectedMapel}</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                Tambah Penilaian Harian
              </Button>
            </Box>

            <Box sx={{ p: { xs: 1, sm: 2 } }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight
                disableRowSelectionOnClick
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.100', fontWeight: 'bold' },
                  '& .static-cell': { bgcolor: 'grey.50', fontWeight: 500 },
                  '& .exam-cell': { bgcolor: 'blue.50' },
                  '& .calculated-cell': { bgcolor: 'grey.200', fontWeight: 600 },
                  '& .final-grade': { bgcolor: 'primary.lighter', color: 'primary.darker', fontWeight: 700 }
                }}
              />
            </Box>
          </Card>
        </Box>
      </Fade>
    )}

    {/* === DIALOG TAMBAH PENILAIAN === */}
    <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="xs">
      <DialogTitle>Tambah Penilaian Harian ({selectedMapel})</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nama Penilaian"
          value={newAssignmentName}
          onChange={(e) => setNewAssignmentName(e.target.value)}
          sx={{ mt: 2 }}
          placeholder="Cth: Tugas Tema 1, UH Bab 2"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCloseAddDialog}>Batal</Button>
        <Button onClick={handleSaveNewAssignment} disabled={!newAssignmentName.trim()} variant="contained">
          Simpan
        </Button>
      </DialogActions>
    </Dialog>

    {/* === SNACKBAR === */}
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

export default HalamanNilaiSiswa;
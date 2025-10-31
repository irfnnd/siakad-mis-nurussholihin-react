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

// === MOCK DATA ===
const mockStudents = [
  { id: 'S-001', nis: '102030', nama: 'Budi Santoso' },
  { id: 'S-002', nis: '102031', nama: 'Ani Yudhoyono' },
  { id: 'S-003', nis: '102032', nama: 'Charlie van Houten' },
  { id: 'S-004', nis: '102033', nama: 'Dewi Lestari' }
];

const mockAssignments = [
  { id: 'A-01', nama: 'Tugas 1', tipe: 'Harian' },
  { id: 'A-02', nama: 'UH 1', tipe: 'Harian' },
  { id: 'PTS-01', nama: 'PTS', tipe: 'PTS' },
  { id: 'PAS-01', nama: 'PAS', tipe: 'PAS' }
];

const mockGrades = [
  { studentId: 'S-001', assignmentId: 'A-01', nilai: 80 },
  { studentId: 'S-001', assignmentId: 'A-02', nilai: 90 },
  { studentId: 'S-001', assignmentId: 'PTS-01', nilai: 85 },
  { studentId: 'S-001', assignmentId: 'PAS-01', nilai: 88 },
  { studentId: 'S-002', assignmentId: 'A-01', nilai: 90 },
  { studentId: 'S-002', assignmentId: 'PTS-01', nilai: 92 },
  { studentId: 'S-003', assignmentId: 'A-01', nilai: 75 },
  { studentId: 'S-003', assignmentId: 'PTS-01', nilai: 70 },
  { studentId: 'S-003', assignmentId: 'PAS-01', nilai: 78 }
];

const mockBobot = { harian: 40, pts: 30, pas: 30 };

// === KOMPONEN UTAMA ===
const HalamanNilaiSiswa = () => {
  // === STATE ===
  const [selectedTahun, setSelectedTahun] = useState('2024/2025');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');

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
    if (!selectedKelas || !selectedMapel) {
      setSnackbar({ open: true, message: 'Silakan pilih Kelas dan Mata Pelajaran.', severity: 'warning' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStudents(mockStudents);
      setAssignments(mockAssignments);
      setGrades(mockGrades);
      setBobot(mockBobot);
      setLoading(false);
      setSnackbar({ open: true, message: `Buku nilai ${selectedMapel} kelas ${selectedKelas} dimuat.`, severity: 'success' });
    }, 1000);
  };

  const handleSimpanBobot = () => {
    if (bobotError) {
      setSnackbar({ open: true, message: 'Total bobot harus 100%.', severity: 'error' });
      return;
    }
    setSnackbar({ open: true, message: 'Bobot berhasil disimpan.', severity: 'success' });
  };

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
  const columns = useMemo(() => {
    if (!assignments?.length) return [];

    const staticCols = [
      { field: 'nis', headerName: 'NIS', width: 100 },
      { field: 'nama', headerName: 'Nama Siswa', flex: 1, minWidth: 200 }
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
        valueGetter: (p) => {
          if (!p?.row) return 0;
          const ids = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id);
          const avg = getAverage(ids.map((id) => p.row?.[id] ?? 0));
          return Math.round(avg);
        }
      },
      {
        field: 'nilaiAkhir',
        headerName: 'Nilai Akhir',
        width: 110,
        valueGetter: (p) => {
          if (!p?.row) return 0;
          const harianIds = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id);
          const ptsId = assignments.find((a) => a.tipe === 'PTS')?.id;
          const pasId = assignments.find((a) => a.tipe === 'PAS')?.id;

          const avgHarian = getAverage(harianIds.map((id) => p.row?.[id] ?? 0));
          const nilaiPts = ptsId ? (p.row?.[ptsId] ?? 0) : 0;
          const nilaiPas = pasId ? (p.row?.[pasId] ?? 0) : 0;

          const final = (avgHarian * bobot.harian) / 100 + (nilaiPts * bobot.pts) / 100 + (nilaiPas * bobot.pas) / 100;
          return Math.round(final);
        }
      },
      {
        field: 'predikat',
        headerName: 'Predikat',
        width: 90,
        valueGetter: (p) => {
          if (!p?.row) return '-';
          const nilaiAkhir = p.api.getCellValue(p.id, 'nilaiAkhir');
          return getPredikat(nilaiAkhir || 0);
        }
      }
    ];

    return [...staticCols, ...dynamicCols, ...calcCols];
  }, [assignments, bobot]);

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
      {/* FILTER */}
      <Card sx={{ mb: 1, p: 2 }}>
        <Grid container spacing={{xs: 1.5, sm: 1.5, md: 2}} alignItems="center">
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} label="Tahun Ajaran">
                <MenuItem value="2024/2025">2024/2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
                <MenuItem value="Ganjil">Ganjil</MenuItem>
                <MenuItem value="Genap">Genap</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 4, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kelas</InputLabel>
              <Select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)} label="Kelas">
                <MenuItem value="10A">10A</MenuItem>
                <MenuItem value="10B">10B</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 8, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Mata Pelajaran</InputLabel>
              <Select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} label="Mata Pelajaran">
                <MenuItem value="Matematika">Matematika</MenuItem>
                <MenuItem value="Fisika">Fisika</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3, md: 1.5 }}>
            <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan}>
              Tampilkan
            </Button>
          </Grid>
        </Grid>
      </Card>

      {students.length > 0 && (
        <Fade in>
          <Box>
            {/* === KONFIGURASI BOBOT === */}
            <Card sx={{ mb: 1, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
              <Typography variant="h6" gutterBottom>
                Konfigurasi Bobot Nilai
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">
                {['harian', 'pts', 'pas'].map((key) => (
                  <Grid item size={{ xs: 4, sm: 3, md: 1.5 }} key={key}>
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
                <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanBobot} disabled={bobotError}>
                    Simpan
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <Typography color={bobotError ? 'error' : 'success'}>
                    Total Bobot: {totalBobot}% {bobotError && '(harus 100%)'}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* === TABEL NILAI === */}
            <Card>
              <Box sx={{ p: { xs: 1.5, sm: 1.5, md: 2 }, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Buku Nilai Siswa</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                  Tambah Penilaian Harian
                </Button>
              </Box>

              <Box sx={{ p: { xs: 1.5, sm: 1.5, md: 2 } }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  autoHeight
                  disableRowSelectionOnClick
                  processRowUpdate={processRowUpdate}
                  onProcessRowUpdateError={handleProcessRowUpdateError}
                />
              </Box>
            </Card>
          </Box>
        </Fade>
      )}

      {/* === DIALOG TAMBAH PENILAIAN === */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="xs">
        <DialogTitle>Tambah Penilaian Harian</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nama Penilaian"
            value={newAssignmentName}
            onChange={(e) => setNewAssignmentName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanNilaiSiswa;

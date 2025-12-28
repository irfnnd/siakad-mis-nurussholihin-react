import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  Fade,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PageviewIcon from '@mui/icons-material/Pageview';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';

// --- IMPORT API ---
import api from '../../../../services/api';

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

// === KOMPONEN UTAMA ===
const HalamanNilaiSiswa = () => {
  
  // === USER INFO ===
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  // === STATE ===
  const [selectedTahun, setSelectedTahun] = useState(''); // Init kosong agar dinamis
  const [selectedSemester, setSelectedSemester] = useState(''); // Init kosong agar dinamis
  
  // State untuk Filter (Dropdown)
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState(''); 
  
  // State Data Master (Opsi Dropdown)
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // State Data Utama
  const [pengajaranId, setPengajaranId] = useState(null); // ID Kunci (Konteks)
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]); // Model: Penilaian
  const [grades, setGrades] = useState([]); // Model: Nilai
  const [bobot, setBobot] = useState({ bobot_harian: 0, bobot_pts: 0, bobot_pas: 0 }); // Model: KonfigurasiBobot

  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentType, setNewAssignmentType] = useState('Harian');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const totalBobot = (parseFloat(bobot.bobot_harian) || 0) + (parseFloat(bobot.bobot_pts) || 0) + (parseFloat(bobot.bobot_pas) || 0);
  const bobotError = totalBobot !== 100;

  // === 1. FETCH DATA MASTER ===
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resMapel, resKelas, resTahun, resSem] = await Promise.all([
          api.get('/mata-pelajaran'),
          api.get('/kelas'),
          api.get('/tahun-ajaran'),
          api.get('/semester')
        ]);
        
        // Normalize Data Mapel
        const dataMapel = resMapel.data?.data?.mata_pelajaran || resMapel.data?.data || [];
        setMapelOptions(Array.isArray(dataMapel) ? dataMapel : []);

        // Normalize Data Kelas
        const dataKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        setKelasOptions(Array.isArray(dataKelas) ? dataKelas : []);
        
        // Normalize Tahun & Set Default Aktif
        const tahunData = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
        const tahunList = Array.isArray(tahunData) ? tahunData : [];
        setTahunOptions(tahunList);
        
        const activeTahun = tahunList.find(t => t.status === 'Aktif');
        if (activeTahun) {
            setSelectedTahun(activeTahun.tahun); 
        } else if (tahunList.length > 0) {
            setSelectedTahun(tahunList[0].tahun); // Fallback ke yang pertama
        }

        // Normalize Semester & Set Default Aktif
        const semData = resSem.data?.data?.semester || resSem.data?.data || [];
        const semList = Array.isArray(semData) ? semData : [];
        setSemesterOptions(semList);
        
        const activeSem = semList.find(s => s.status === 'Aktif');
        if (activeSem) {
            setSelectedSemester(activeSem.id);
        } else if (semList.length > 0) {
            setSelectedSemester(semList[0].id); // Fallback ke yang pertama
        }

      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchOptions();
  }, []);

  // === 2. HANDLE TAMPILKAN (INIT PENGAJARAN) ===
  const handleTampilkan = async () => {
    if (!selectedKelas || !selectedMapel || !selectedSemester) {
      setSnackbar({ open: true, message: 'Harap lengkapi filter (Kelas, Mapel, Semester).', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    setPengajaranId(null);
    setStudents([]); // Reset students agar loading state jelas

    try {
      // --- LANGKAH 1: FETCH SISWA DULU (AGAR TABEL MUNCUL) ---
      // Ini prioritas utama. User harus melihat daftar siswa meskipun belum ada nilai.
      const resSiswa = await api.get('/siswa', { params: { kelas_id: selectedKelas, limit: 1000 } });
      const rawStudents = resSiswa.data?.data?.siswa || [];
      const studentList = Array.isArray(rawStudents) ? rawStudents : [];
      setStudents(studentList);

      if (studentList.length === 0) {
         setSnackbar({ open: true, message: 'Tidak ada siswa ditemukan di kelas ini.', severity: 'info' });
         setLoading(false);
         return; // Tidak perlu lanjut jika tidak ada siswa
      }

      // --- LANGKAH 2: CARI / BUAT PENGAJARAN (CONTEXT NILAI) ---
      let currentPengajaran = null;
      try {
        const resPengajaran = await api.get('/pengajaran', {
            params: {
              kelas_id: selectedKelas,
              mapel_id: selectedMapel,
              semester_id: selectedSemester
            }
        });
        
        let pList = resPengajaran.data?.data?.pengajaran || resPengajaran.data?.data;
        if (Array.isArray(pList)) currentPengajaran = pList[0];

        // Jika tidak ada, coba buat otomatis
        if (!currentPengajaran) {
            let guruIdToAssign = null;
            
            // Cek Guru dari Login
            if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
                guruIdToAssign = currentUser.pegawai.id;
            } else {
                // Cek Wali Kelas dari Opsi Kelas
                const selectedKelasObj = kelasOptions.find(k => k.id === selectedKelas);
                if (selectedKelasObj?.wali_kelas_id) {
                    guruIdToAssign = selectedKelasObj.wali_kelas_id;
                }
            }

            if (guruIdToAssign) {
                const createRes = await api.post('/pengajaran', {
                    guru_id: guruIdToAssign,
                    mapel_id: selectedMapel,
                    kelas_id: selectedKelas,
                    semester_id: selectedSemester
                });
                currentPengajaran = createRes.data?.data;

                // --- PERBAIKAN: AUTO-CREATE KOLOM PTS & PAS ---
                // Karena ini pengajaran baru, kita buatkan kolom wajib ini otomatis
                if (currentPengajaran?.id) {
                   await Promise.all([
                      api.post('/penilaian', { pengajaran_id: currentPengajaran.id, nama_penilaian: 'PTS', tipe: 'PTS' }),
                      api.post('/penilaian', { pengajaran_id: currentPengajaran.id, nama_penilaian: 'PAS', tipe: 'PAS' })
                   ]);
                }
                
                setSnackbar({ open: true, message: 'Data Pengajaran & Penilaian Awal berhasil diinisialisasi.', severity: 'success' });
            } else {
                console.warn("Guru tidak terdeteksi, mode view-only");
            }
        }
      } catch (err) {
          console.error("Gagal init pengajaran:", err);
      }

      // --- LANGKAH 3: JIKA PENGAJARAN ADA, FETCH NILAI & BOBOT ---
      if (currentPengajaran) {
          const pId = currentPengajaran.id;
          setPengajaranId(pId);

          const [resPenilaian, resBobot, resNilai] = await Promise.allSettled([
            api.get('/penilaian', { params: { pengajaran_id: pId } }), 
            api.get('/konfigurasi-bobot', { params: { pengajaran_id: pId } }),
            api.get('/nilai', { params: { pengajaran_id: pId, limit: 1000 } })
          ]);

          // Penilaian (Kolom)
          if (resPenilaian.status === 'fulfilled') {
            const raw = resPenilaian.value.data?.data?.penilaian || resPenilaian.value.data?.data || [];
            setAssignments(Array.isArray(raw) ? raw : []);
          } else { setAssignments([]); }

          // Bobot
          if (resBobot.status === 'fulfilled') {
            const raw = resBobot.value.data?.data?.konfigurasi_bobot || resBobot.value.data?.data;
            const bobotData = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
            setBobot({
                bobot_harian: bobotData.bobot_harian || 0,
                bobot_pts: bobotData.bobot_pts || 0,
                bobot_pas: bobotData.bobot_pas || 0
            });
          }

          // Nilai (Cell)
          if (resNilai.status === 'fulfilled') {
            const raw = resNilai.value.data?.data?.nilai || [];
            setGrades(Array.isArray(raw) ? raw.map(g => ({
                studentId: String(g.siswa_id),
                assignmentId: String(g.penilaian_id),
                nilai: parseFloat(g.nilai)
            })) : []);
          } else { setGrades([]); }

      } else {
          // Jika Pengajaran Gagal diload, reset nilai tapi SISWA TETAP TAMPIL
          setAssignments([]);
          setGrades([]);
          setSnackbar({ open: true, message: 'Data siswa dimuat (Mode Baca - Pengajar belum diset).', severity: 'info' });
      }

    } catch (error) {
      console.error("Critical error fetching data:", error);
      setSnackbar({ open: true, message: 'Terjadi kesalahan saat memuat data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === 3. SIMPAN BOBOT ===
  const handleSimpanBobot = async () => {
    if (bobotError) {
      setSnackbar({ open: true, message: 'Total bobot harus 100%.', severity: 'error' });
      return;
    }
    if (!pengajaranId) return;

    try {
      await api.post('/konfigurasi-bobot', {
        pengajaran_id: pengajaranId,
        bobot_harian: bobot.bobot_harian,
        bobot_pts: bobot.bobot_pts,
        bobot_pas: bobot.bobot_pas
      });
      setSnackbar({ open: true, message: `Bobot berhasil disimpan.`, severity: 'success' });
    } catch (error) {
      console.error("Error saving bobot:", error);
      setSnackbar({ open: true, message: 'Gagal menyimpan bobot.', severity: 'error' });
    }
  };

  // === 4. TAMBAH PENILAIAN (KOLOM BARU) ===
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleSaveNewAssignment = async () => {
    if (!newAssignmentName.trim() || !pengajaranId) return;

    try {
      const response = await api.post('/penilaian', {
        pengajaran_id: pengajaranId,
        nama_penilaian: newAssignmentName,
        tipe: newAssignmentType // 'Harian', 'PTS', 'PAS'
      });

      const newAssign = response.data?.data; 
      if (newAssign) {
          // Normalisasi data baru agar sesuai state assignments
          const mappedAssign = {
              id: String(newAssign.id),
              nama_penilaian: newAssign.nama_penilaian,
              nama: newAssign.nama_penilaian, // Fallback
              tipe: newAssign.tipe
          };
          setAssignments((prev) => [...prev, mappedAssign]);
          setSnackbar({ open: true, message: `Kolom '${newAssignmentName}' ditambahkan.`, severity: 'success' });
      }
      
      setNewAssignmentName('');
      handleCloseAddDialog();

    } catch (error) {
      console.error("Error adding assignment:", error);
      setSnackbar({ open: true, message: 'Gagal menambah penilaian.', severity: 'error' });
    }
  };

  // === 5. EDIT NILAI (CELL EDIT) ===
  const processRowUpdate = async (newRow, oldRow) => {
    for (const assign of assignments) {
      const fieldId = assign.id.toString(); 
      let newValue = parseFloat(newRow[fieldId]);
      const oldValue = parseFloat(oldRow[fieldId]);

      if (isNaN(newValue)) newValue = null;
      if (newValue < 0 || newValue > 100) newValue = null;

      if (newValue !== oldValue && (newValue !== null || oldValue !== null)) { 
        try {
          await api.post('/nilai', {
             siswa_id: newRow.id,
             penilaian_id: assign.id, // ID dari tabel penilaian
             nilai: newValue
          });

          setGrades((prev) => {
            const idx = prev.findIndex((g) => String(g.studentId) === String(newRow.id) && String(g.assignmentId) === String(assign.id));
            if (idx > -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], nilai: newValue };
              return updated;
            } else if (newValue !== null) {
              return [...prev, { studentId: String(newRow.id), assignmentId: String(assign.id), nilai: newValue }];
            }
            return prev;
          });

        } catch (error) {
          console.error("Error saving grade:", error);
          setSnackbar({ open: true, message: 'Gagal menyimpan nilai.', severity: 'error' });
          return oldRow;
        }
      }
    }
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error(error);
    setSnackbar({ open: true, message: 'Gagal menyimpan nilai.', severity: 'error' });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // === DATAGRID COLUMNS SETUP ===
  const columns = useMemo(() => {
    // 1. Kolom Statis (Data Siswa)
    const staticCols = [
      { field: 'nis', headerName: 'NIS', width: 100 },
      { 
        field: 'nama', 
        headerName: 'Nama Siswa', 
        flex: 1, 
        minWidth: 200,
        valueGetter: (value, row) => {
            const rowData = row || value?.row || value;
            return rowData?.nama_lengkap || rowData?.nama || '-';
        }
      }
    ];

    if (!Array.isArray(assignments) || assignments.length === 0) {
         return staticCols;
    }

    // 2. Kolom Dinamis (Nilai)
    const dynamicCols = assignments.map((a) => ({
      field: a.id.toString(), 
      headerName: `${a.nama_penilaian || a.nama} (${a.tipe})`,
      width: 140,
      type: 'number',
      editable: true,
      cellClassName: a.tipe === 'Harian' ? 'daily-cell' : 'exam-cell'
    }));

    // 3. Kolom Kalkulasi
    const calcCols = [
      {
        field: 'avgHarian',
        headerName: 'Rata2 Harian',
        width: 110,
        valueGetter: (value, row) => {
          const rowData = row || value?.row;
          if (!rowData) return 0;
          const ids = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id.toString());
          const values = ids.map((id) => rowData[id]);
          const avg = getAverage(values);
          return Math.round(avg);
        }
      },
      {
        field: 'nilaiAkhir',
        headerName: 'Nilai Akhir',
        width: 110,
        valueGetter: (value, row) => {
          const rowData = row || value?.row;
          if (!rowData) return 0;
          
          const harianIds = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id.toString());
          const harianValues = harianIds.map((id) => rowData[id]);
          const avgHarian = getAverage(harianValues);

          const ptsAssign = assignments.find((a) => a.tipe === 'PTS');
          const pasAssign = assignments.find((a) => a.tipe === 'PAS');
          
          const ptsId = ptsAssign ? ptsAssign.id.toString() : null;
          const pasId = pasAssign ? pasAssign.id.toString() : null;

          const nilaiPts = ptsId ? (rowData[ptsId] || 0) : 0;
          const nilaiPas = pasId ? (rowData[pasId] || 0) : 0;

          const final = (avgHarian * (bobot.bobot_harian || 0)) / 100 + 
                        (nilaiPts * (bobot.bobot_pts || 0)) / 100 + 
                        (nilaiPas * (bobot.bobot_pas || 0)) / 100;
          return Math.round(final);
        }
      },
      {
        field: 'predikat',
        headerName: 'Predikat',
        width: 90,
        valueGetter: (value, row) => {
          const rowData = row || value?.row;
          if (!rowData) return '-';
          
          const harianIds = assignments.filter((a) => a.tipe === 'Harian').map((a) => a.id.toString());
          const harianValues = harianIds.map((id) => rowData[id]);
          const avgHarian = getAverage(harianValues);

          const ptsAssign = assignments.find((a) => a.tipe === 'PTS');
          const pasAssign = assignments.find((a) => a.tipe === 'PAS');
          const ptsId = ptsAssign ? ptsAssign.id.toString() : null;
          const pasId = pasAssign ? pasAssign.id.toString() : null;

          const nilaiPts = ptsId ? (rowData[ptsId] || 0) : 0;
          const nilaiPas = pasId ? (rowData[pasId] || 0) : 0;

          const final = (avgHarian * (bobot.bobot_harian || 0)) / 100 + 
                        (nilaiPts * (bobot.bobot_pts || 0)) / 100 + 
                        (nilaiPas * (bobot.bobot_pas || 0)) / 100;
          
          return getPredikat(final);
        }
      }
    ];

    return [...staticCols, ...dynamicCols, ...calcCols];
  }, [assignments, bobot, students]); 

  // Mapping Rows
  const rows = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.map((s) => {
      const row = { id: s.id, nis: s.nis, nama: s.nama || s.nama_lengkap };
      
      if (Array.isArray(assignments)) {
        assignments.forEach((a) => {
          const g = grades.find((gr) => String(gr.studentId) === String(s.id) && String(gr.assignmentId) === String(a.id));
          row[a.id.toString()] = g ? parseFloat(g.nilai) : null; 
        });
      }
      return row;
    });
  }, [students, assignments, grades]);

  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* HEADER & FILTER */}
      <Card sx={{ mb: 1, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* FILTER SEMESTER & TAHUN */}
          <Grid size={{ xs: 5, sm: 4, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} label="Tahun Ajaran">
                 {tahunOptions.map(t => (
                    <MenuItem key={t.id} value={t.tahun}>{t.tahun}</MenuItem>
                 ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
                 {semesterOptions.map(s => <MenuItem key={s.id} value={s.id}>{s.nama}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* FILTER KELAS */}
          <Grid size={{ xs: 3, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
                <InputLabel>Kelas</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                    {kelasOptions.map((k) => (
                        <MenuItem key={k.id} value={k.id}>
                            {k.nama_kelas}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
          </Grid>

          {/* FILTER MAPEL */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Mata Pelajaran</InputLabel>
              <Select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} label="Mata Pelajaran">
                {mapelOptions.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                        {m.nama_mapel}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan} disabled={loading}>
              {loading ? '...' : 'Tampilkan'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* KONTEN UTAMA */}
      {/* Tampilkan tabel jika ada siswa yang ditemukan */}
      {students.length > 0 ? (
        <Fade in>
          <Box>
            {/* CONFIG BOBOT (Hanya jika pengajaranId ada / guru valid) */}
            {pengajaranId && (
                <Card sx={{ mb: 1, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
                <Typography variant="h6" gutterBottom>
                    Konfigurasi Bobot Nilai
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    {['harian', 'pts', 'pas'].map((key) => (
                    <Grid item size={{ xs: 4, sm: 3, md: 2 }} key={key}>
                        <TextField
                        label={`Bobot ${key.toUpperCase()}`}
                        type="number"
                        size="small"
                        fullWidth
                        value={bobot[`bobot_${key}`]} 
                        onChange={(e) => setBobot(b => ({ ...b, [`bobot_${key}`]: parseFloat(e.target.value) || 0 }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />
                    </Grid>
                    ))}
                    <Grid item size={{ xs: 6, sm: 3, md: 2 }}>
                    <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanBobot} disabled={bobotError}>
                        Simpan
                    </Button>
                    </Grid>
                    <Grid item size={{ xs: 6, sm: 6, md: 4 }}>
                    <Typography color={bobotError ? 'error' : 'success'}>
                        Total: {totalBobot}% {bobotError && '(harus 100%)'}
                    </Typography>
                    </Grid>
                </Grid>
                </Card>
            )}

            {/* TABEL */}
            <Card>
              <Box sx={{ p: { xs: 1.5, sm: 1.5, md: 2 }, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Buku Nilai Siswa</Typography>
                {pengajaranId && (
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                    Tambah Kolom Nilai
                    </Button>
                )}
              </Box>
              
              {/* PESAN JIKA BELUM ADA KOLOM */}
              {pengajaranId && Array.isArray(assignments) && assignments.length === 0 && (
                <Alert severity="info" sx={{ m: 2 }}>
                  Belum ada kolom penilaian untuk mata pelajaran ini. Silakan klik "Tambah Kolom Nilai" (misal: Tugas 1, UH 1) untuk mulai menginput nilai.
                </Alert>
              )}

              <Box sx={{ p: { xs: 1.5, sm: 1.5, md: 2 } }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  autoHeight
                  disableRowSelectionOnClick
                  processRowUpdate={processRowUpdate}
                  onProcessRowUpdateError={handleProcessRowUpdateError}
                  components={{
                    NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                            Tidak ada siswa di kelas ini.
                        </Stack>
                    )
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Fade>
      ) : (
         /* Jika tidak ada siswa tetapi sudah loading selesai */
         !loading && selectedKelas && selectedMapel && (
             <Alert severity="info" sx={{ mt: 2 }}>Tidak ada siswa ditemukan di kelas ini.</Alert>
         )
      )}

      {/* DIALOG TAMBAH PENILAIAN */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="xs">
        <DialogTitle>Tambah Kolom Nilai</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
                fullWidth label="Nama Penilaian (cth: Tugas 1)"
                value={newAssignmentName} onChange={(e) => setNewAssignmentName(e.target.value)}
            />
            <FormControl fullWidth>
                <InputLabel>Tipe</InputLabel>
                <Select value={newAssignmentType} label="Tipe" onChange={(e) => setNewAssignmentType(e.target.value)}>
                    <MenuItem value="Harian">Harian (Tugas/UH)</MenuItem>
                    <MenuItem value="PTS">PTS</MenuItem>
                    <MenuItem value="PAS">PAS</MenuItem>
                </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Batal</Button>
          <Button onClick={handleSaveNewAssignment} disabled={!newAssignmentName.trim()} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanNilaiSiswa;
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
import DownloadIcon from '@mui/icons-material/Download';

// --- IMPORT EXCELJS & FILE-SAVER ---
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- IMPORT API ---
import api from '../../../../services/api';

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Helper: Format Waktu "07:00:00" -> "07:00"
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
};

// === KOMPONEN UTAMA ===
const JadwalPelajaran = () => {
  // === USER INFO ===
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  // === STATE MANAGEMENT ===
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Data Master (dari API)
  const [guruOptions, setGuruOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]); // State untuk opsi tahun ajaran
  const [waliKelasMap, setWaliKelasMap] = useState({}); // Map: KelasID -> GuruID

  // Filter State
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(''); // Default kosong, nanti diisi otomatis
  const [selectedSemester, setSelectedSemester] = useState(1); // Default Semester 1

  // Form State
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kelas_id: '',
    hari: 'Senin',
    jam_mulai: '07:00',
    jam_selesai: '07:35',
    mapel_id: '',
    guru_id: ''
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedJadwalToDelete, setSelectedJadwalToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // === 1. FETCH DATA MASTER ===
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resGuru, resMapel, resKelas, resTahun] = await Promise.all([
          api.get('/pegawai'),
          api.get('/mata-pelajaran'),
          api.get('/kelas'),
          api.get('/tahun-ajaran') // Fetch Tahun Ajaran
        ]);

        // Ekstrak data Guru
        const dataGuru = resGuru.data?.data?.pegawai || resGuru.data?.data || [];
        setGuruOptions(Array.isArray(dataGuru) ? dataGuru : []);

        // Ekstrak data Mapel
        const dataMapel = resMapel.data?.data?.mata_pelajaran || resMapel.data?.data || [];
        setMapelOptions(Array.isArray(dataMapel) ? dataMapel : []);

        // Ekstrak data Kelas
        const dataKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        let processedKelas = Array.isArray(dataKelas) ? dataKelas : [];

        // --- LOGIKA FILTER KELAS UNTUK WALI KELAS ---
        if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
          // Cari kelas di mana guru ini adalah wali kelasnya
          const myClass = processedKelas.find((k) => String(k.wali_kelas_id) === String(currentUser.pegawai.id));
          if (myClass) {
            // Jika ketemu, set opsi kelas hanya kelas tersebut dan auto-select
            processedKelas = [myClass];
            setSelectedKelas(myClass.id);
          }
        } else if (processedKelas.length > 0 && !selectedKelas) {
          // Jika Admin dan belum pilih, default ke kelas pertama
          setSelectedKelas(processedKelas[0].id);
        }
        setKelasOptions(processedKelas);

        // Mapping Wali Kelas (Kelas ID -> Guru ID)
        if (processedKelas.length > 0) {
          const mapWali = {};
          processedKelas.forEach((k) => {
            if (k.wali_kelas_id) {
              mapWali[k.id] = k.wali_kelas_id;
            }
          });
          setWaliKelasMap(mapWali);
        }

        // Ekstrak & Set Tahun Ajaran Aktif
        const dataTahun = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
        setTahunOptions(Array.isArray(dataTahun) ? dataTahun : []);

        // Cari tahun dengan status 'Aktif'
        const activeTahun = Array.isArray(dataTahun) ? dataTahun.find((t) => t.status === 'Aktif') : null;
        if (activeTahun) {
          setSelectedTahunAjaran(activeTahun.tahun);
        } else if (dataTahun.length > 0) {
          // Fallback ke tahun pertama jika tidak ada yang aktif
          setSelectedTahunAjaran(dataTahun[0].tahun);
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
        setSnackbar({ open: true, message: 'Gagal memuat data master', severity: 'error' });
      }
    };

    if (currentUser) {
      fetchMasterData();
    }
  }, [currentUser]); // Dependensi currentUser agar reload saat user terdeteksi

  // === 2. FETCH JADWAL ===
  const fetchJadwal = async () => {
    if (!selectedKelas) return;
    setLoading(true);
    try {
      // Backend filter: ?kelas_id=...
      const response = await api.get('/jadwal-pelajaran', {
        params: { kelas_id: selectedKelas }
      });

      const data = response.data?.data?.jadwal_pelajaran || response.data?.data || [];
      setJadwalList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, [selectedKelas, selectedTahunAjaran]);

  // === TRANSFORM DATA KE TABEL MATRIKS ===
  const tableRows = useMemo(() => {
    if (!Array.isArray(jadwalList)) return [];

    // 1. Ambil slot waktu unik (Format HH:mm)
    const uniqueTimes = [...new Set(jadwalList.map((item) => `${formatTime(item.jam_mulai)} - ${formatTime(item.jam_selesai)}`))].sort();

    return uniqueTimes.map((timeSlot) => {
      const [start, end] = timeSlot.split(' - ');
      const rowData = { time: timeSlot };

      days.forEach((day) => {
        // 2. Cari entry jadwal yang cocok
        const entry = jadwalList.find((item) => item.hari === day && formatTime(item.jam_mulai) === start);

        if (entry) {
          // 3. Flatten data relasi untuk ditampilkan di tabel
          rowData[day.toLowerCase()] = {
            id: entry.id,
            // Ambil nama dari relasi (include dari backend)
            mapel_nama: entry.mapel?.nama_mapel || entry.mata_pelajaran_jadwal?.nama_mapel || '?',
            guru_nama: entry.guru?.nama_lengkap || '-',

            // Data ID untuk keperluan edit
            mapel_id: entry.mapel_id,
            guru_id: entry.guru_id,
            hari: entry.hari,
            jam_mulai: entry.jam_mulai,
            jam_selesai: entry.jam_selesai
          };
        } else {
          rowData[day.toLowerCase()] = null;
        }
      });
      return rowData;
    });
  }, [jadwalList]);

  // === HANDLERS ===

  // Auto-fill Guru Wali Kelas saat Mapel dipilih
  const handleMapelChange = (mapelId) => {
    const selectedMapel = mapelOptions.find((m) => m.id === mapelId);
    let autoGuruId = ''; // Default kosong

    // Logika: Jika Mapel Kelompok 'Tematik', otomatis isi Wali Kelas
    // Sesuaikan string 'Tematik' dengan data di database Anda
    if (selectedMapel?.kelompok === 'Tematik' || selectedMapel?.kelompok === 'Tematik Terpadu') {
      autoGuruId = waliKelasMap[formData.kelas_id] || '';
    }

    setFormData((prev) => ({
      ...prev,
      mapel_id: mapelId,
      guru_id: autoGuruId
    }));
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      id: null,
      kelas_id: selectedKelas, // Gunakan ID
      hari: 'Senin',
      jam_mulai: '07:00',
      jam_selesai: '07:35',
      mapel_id: '',
      guru_id: ''
    });
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (entryData) => {
    setIsEditMode(true);
    setFormData({
      id: entryData.id,
      kelas_id: selectedKelas,
      hari: entryData.hari,
      // Format waktu agar bisa dibaca input type="time"
      jam_mulai: formatTime(entryData.jam_mulai),
      jam_selesai: formatTime(entryData.jam_selesai),
      mapel_id: entryData.mapel_id,
      guru_id: entryData.guru_id
    });
    setOpenFormDialog(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      kelas_id: formData.kelas_id,
      hari: formData.hari,
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      mapel_id: formData.mapel_id,
      guru_id: formData.guru_id,
      semester_id: selectedSemester // Wajib diisi sesuai model
    };

    try {
      if (isEditMode) {
        await api.put(`/jadwal-pelajaran/${formData.id}`, payload);
        setSnackbar({ open: true, message: 'Jadwal diperbarui', severity: 'success' });
      } else {
        await api.post('/jadwal-pelajaran', payload);
        setSnackbar({ open: true, message: 'Jadwal ditambahkan', severity: 'success' });
      }

      fetchJadwal();
      setOpenFormDialog(false);
    } catch (err) {
      console.error('Error saving jadwal:', err);
      const errMsg = err.response?.data?.message || 'Gagal menyimpan jadwal';
      setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJadwalToDelete) return;

    try {
      await api.delete(`/jadwal-pelajaran/${selectedJadwalToDelete.id}`);
      setSnackbar({ open: true, message: 'Jadwal dihapus', severity: 'success' });
      fetchJadwal();
      setOpenConfirmDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Gagal menghapus', severity: 'error' });
    }
  };

  // Export Excel
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();

    // Ambil nama kelas dari ID
    const currentKelasObj = kelasOptions.find((k) => k.id === selectedKelas);
    const namaKelas = currentKelasObj ? currentKelasObj.nama_kelas : 'Jadwal';

    const worksheet = workbook.addWorksheet(`Jadwal ${namaKelas}`);

    worksheet.columns = [
      { header: 'Waktu', key: 'time', width: 15 },
      { header: 'Senin', key: 'senin', width: 30 },
      { header: 'Selasa', key: 'selasa', width: 30 },
      { header: 'Rabu', key: 'rabu', width: 30 },
      { header: 'Kamis', key: 'kamis', width: 30 },
      { header: 'Jumat', key: 'jumat', width: 30 },
      { header: 'Sabtu', key: 'sabtu', width: 30 }
    ];

    tableRows.forEach((row) => {
      const exportRow = { time: row.time };
      days.forEach((day) => {
        const entry = row[day.toLowerCase()];
        // Format text cell untuk Excel
        exportRow[day.toLowerCase()] = entry ? `${entry.mapel_nama}\n(${entry.guru_nama})` : '';
      });
      worksheet.addRow(exportRow);
    });

    // Styling Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Styling Content
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) row.height = 45;
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Jadwal_${namaKelas}.xlsx`);
  };

  // === RENDER UTAMA ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* HEADER & FILTER */}
      <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* KOLOM PILIH KELAS */}
              {/* Jika Guru & Wali Kelas, Tampilkan Read-only. Jika tidak, Dropdown */}
              <Grid size={{ xs: 12, sm: 6 }}>
                {currentUser?.role === 'Guru' && kelasOptions.length === 1 ? (
                  <TextField
                    label="Kelas Perwalian"
                    size="small"
                    fullWidth
                    value={kelasOptions[0].nama_kelas}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'primary.main' } }}
                  />
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Pilih Kelas</InputLabel>
                    <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                      {kelasOptions.length > 0 ? (
                        kelasOptions.map((k) => (
                          <MenuItem key={k.id} value={k.id}>
                             {k.nama_kelas}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="">Loading Kelas...</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tahun Ajaran</InputLabel>
                  <Select value={selectedTahunAjaran} label="Tahun Ajaran" onChange={(e) => setSelectedTahunAjaran(e.target.value)}>
                    {tahunOptions.length > 0 ? (
                      tahunOptions.map((t) => (
                        <MenuItem key={t.id} value={t.tahun}>
                          {t.tahun}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">Loading Tahun Ajaran...</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
                Export Excel
              </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                  Tambah Jadwal
                </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Info Wali Kelas */}
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
          {/* Cari nama wali kelas berdasarkan ID kelas yang dipilih */}
          Wali Kelas saat ini: {kelasOptions.find((k) => k.id === selectedKelas)?.wali_kelas?.nama_lengkap || '(Belum diset)'}
        </Typography>
      </Card>

      {/* TABEL JADWAL */}
      <Card>
        <TableContainer component={Paper} sx={{ overflowX: 'auto', border: 'none', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: 100 }}>Waktu</TableCell>
                {days.map((day) => (
                  <TableCell key={day} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.length > 0 ? (
                tableRows.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell align="center" sx={{ fontWeight: 500, bgcolor: 'grey.50' }}>
                      {row.time}
                    </TableCell>

                    {days.map((day) => {
                      const entry = row[day.toLowerCase()];

                      if (!entry) {
                        return <TableCell key={day} sx={{ borderRight: '1px solid #eee' }} />;
                      }

                      return (
                        <TableCell key={day} sx={{ verticalAlign: 'top', p: 1, borderRight: '1px solid #eee' }}>
                          <Card
                            variant="outlined"
                            sx={{
                              bgcolor: 'primary.lighter',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              p: 1,
                              position: 'relative',
                              '&:hover .actions': { display: 'flex' }
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                              {entry.mapel_nama}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {entry.guru_nama}
                            </Typography>

                            {/* Action Buttons */}
                            <Stack
                              className="actions"
                              direction="row"
                              spacing={0.5}
                              sx={{
                                display: 'none',
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                bgcolor: 'white',
                                borderRadius: 1,
                                boxShadow: 1
                              }}
                            >
                              <IconButton size="small" onClick={() => handleOpenEdit(entry)}>
                                <EditIcon fontSize="small" color="primary" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedJadwalToDelete(entry);
                                  setOpenConfirmDialog(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Stack>
                          </Card>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Belum ada jadwal untuk kelas ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', gap: 1 }}>
          <CalendarMonthIcon /> {isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kelas</InputLabel>
                  <Select value={formData.kelas_id} label="Kelas" disabled>
                    {kelasOptions.map((k) => (
                      <MenuItem key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Hari</InputLabel>
                  <Select value={formData.hari} label="Hari" onChange={(e) => setFormData({ ...formData, hari: e.target.value })}>
                    {days.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Jam Mulai"
                  type="time"
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.jam_mulai}
                  onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Jam Selesai"
                  type="time"
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.jam_selesai}
                  onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                />
              </Grid>

              {/* Mapel (ID) */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Mata Pelajaran</InputLabel>
                  <Select value={formData.mapel_id} label="Mata Pelajaran" onChange={(e) => handleMapelChange(e.target.value)}>
                    {mapelOptions.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nama_mapel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Guru (ID) */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Guru Pengajar</InputLabel>
                  <Select
                    value={formData.guru_id}
                    label="Guru Pengajar"
                    onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Pilih Guru</em>
                    </MenuItem>
                    {/* Opsi Cepat: Wali Kelas */}
                    {waliKelasMap[formData.kelas_id] && (
                      <MenuItem value={waliKelasMap[formData.kelas_id]} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        {guruOptions.find((g) => g.id === waliKelasMap[formData.kelas_id])?.nama_lengkap} (Wali Kelas)
                      </MenuItem>
                    )}
                    <MenuItem disabled>────────────────</MenuItem>

                    {guruOptions.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.nama_lengkap}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Otomatis terisi Wali Kelas untuk Mapel Tematik</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenFormDialog(false)}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIALOG HAPUS */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Hapus Jadwal?</DialogTitle>
        <DialogContent>
          <Typography>Yakin ingin menghapus jadwal ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default JadwalPelajaran;

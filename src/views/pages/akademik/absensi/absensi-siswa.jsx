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
  DialogActions,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageviewIcon from '@mui/icons-material/Pageview';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// --- IMPORT API ---
import api from '../../../../services/api'; 

// === Helper ===
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// === Komponen Utama ===
const HalamanAbsensiHarian = () => {
  
  // 1. AMBIL USER DARI LOCALSTORAGE
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuru, setIsGuru] = useState(false);
  const [myWaliKelasInfo, setMyWaliKelasInfo] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      const role = user.role ? user.role.toLowerCase() : '';
      setIsAdmin(role === 'admin');
      setIsGuru(role === 'guru');
    }
  }, []);

  // === STATE ===
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1); 
  
  // Data Options
  const [kelasOptions, setKelasOptions] = useState([]);

  // Data Utama
  const [rows, setRows] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState({});
  const [attendanceIds, setAttendanceIds] = useState({}); 

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  // === 2. FETCH DATA KELAS & DETEKSI WALI KELAS ===
  const fetchKelasAndInit = async () => {
    try {
      const response = await api.get('/kelas');
      const data = response.data?.data?.kelas || response.data?.data || [];
      const classesList = Array.isArray(data) ? data : [];
      
      setKelasOptions(classesList);

      // JIKA GURU: Cari kelas yang dia ampu
      if (isGuru && currentUser?.pegawai) {
        const myPegawaiId = currentUser.pegawai.id;
        
        // Cari kelas dimana wali_kelas_id == myPegawaiId
        const myClass = classesList.find(c => c.wali_kelas_id === myPegawaiId);
        
        if (myClass) {
          setMyWaliKelasInfo({ id: myClass.id, nama: myClass.nama_kelas });
          setSelectedKelas(myClass.id); // Otomatis pilih kelasnya
        }
      }

    } catch (error) {
      console.error("Error fetching kelas:", error);
      setSnackbar({ open: true, message: 'Gagal memuat daftar kelas.', severity: 'error' });
    }
  };

  // Jalankan inisialisasi saat role user sudah terdeteksi
  useEffect(() => {
    if (currentUser) {
        fetchKelasAndInit();
    }
  }, [currentUser, isGuru]);


  // === 3. FETCH DATA SISWA & ABSENSI ===
  const handleTampilkan = async () => {
    if (!selectedKelas) {
      if (isAdmin) setSnackbar({ open: true, message: 'Silakan pilih kelas.', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      // A. Ambil Data Siswa di Kelas
      const resSiswa = await api.get('/siswa', { params: { kelas_id: selectedKelas, limit: 100 } });
      const siswaList = resSiswa.data?.data?.siswa || [];
      
      // B. Ambil Data Absensi Existing
      const resAbsensi = await api.get('/absensi-harian', { 
        params: { 
            kelas_id: selectedKelas,
            tanggal: selectedDate,
            limit: 100
        } 
      });
      const absensiExisting = resAbsensi.data?.data?.absensi_harian || [];

      // C. Mapping Data
      const statusMap = {};
      const idMap = {};

      // Default 'H'
      siswaList.forEach(s => { 
          statusMap[s.id] = 'H'; 
          idMap[s.id] = null; 
      });

      // Timpa dengan data DB
      absensiExisting.forEach(record => {
          if (record.siswa_id) {
              statusMap[record.siswa_id] = record.status; 
              idMap[record.siswa_id] = record.id; 
          }
      });

      setRows(siswaList);
      setDailyAttendance(statusMap);
      setAttendanceIds(idMap);

      if (isAdmin) {
        setSnackbar({ open: true, message: `Data dimuat.`, severity: 'success' });
      }

    } catch (error) {
      console.error("Error loading data:", error);
      setSnackbar({ open: true, message: 'Gagal memuat data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === EFEK OTOMATIS LOAD DATA (Khusus Guru) ===
  useEffect(() => {
    // Jika Guru dan kelas sudah terpilih (dari deteksi wali kelas), load otomatis
    if (isGuru && selectedKelas) {
      handleTampilkan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedKelas, isGuru]);


  // === HANDLERS UI ===
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
    setSnackbar({ open: true, message: 'Semua ditandai Hadir (Draft).', severity: 'info' });
  };

  const handleSimpanAbsensi = async () => {
    setLoading(true);
    try {
        const promises = rows.map(async (siswa) => {
            const currentStatus = dailyAttendance[siswa.id] || 'H';
            const recordId = attendanceIds[siswa.id];

            if (recordId) {
                if (currentStatus === 'H') {
                    // Delete
                    try {
                        await api.delete(`/absensi-harian/${recordId}`);
                        setAttendanceIds(prev => ({ ...prev, [siswa.id]: null }));
                    } catch (e) { console.error("Gagal delete", e); }
                } else {
                    // Update
                    await api.put(`/absensi-harian/${recordId}`, {
                        status: currentStatus,
                        keterangan: '' 
                    });
                }
            } else {
                if (currentStatus !== 'H') {
                    // Create
                    const response = await api.post('/absensi-harian', {
                        siswa_id: siswa.id,
                        tanggal: selectedDate,
                        status: currentStatus,
                        semester_id: selectedSemester,
                        keterangan: ''
                    });
                    const newId = response.data?.data?.id;
                    if(newId) setAttendanceIds(prev => ({ ...prev, [siswa.id]: newId }));
                }
            }
        });

        await Promise.all(promises);
        setSnackbar({ open: true, message: 'Absensi berhasil disimpan!', severity: 'success' });
        
        // Refresh jika admin
        if (isAdmin) handleTampilkan();

    } catch (error) {
        console.error("Error saving batch:", error);
        setSnackbar({ open: true, message: 'Terjadi kesalahan saat menyimpan.', severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // === Kolom DataGrid ===
  const columns = [
    { field: 'nis', headerName: 'NIS', width: 130 },
    { field: 'nama_lengkap', headerName: 'Nama Siswa', flex: 1, minWidth: 250 },
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
            <ToggleButton value="H" color="success" sx={{ fontWeight: 600 }}>H</ToggleButton>
            <ToggleButton value="S" color="info" sx={{ fontWeight: 600 }}>S</ToggleButton>
            <ToggleButton value="I" color="warning" sx={{ fontWeight: 600 }}>I</ToggleButton>
            <ToggleButton value="A" color="error" sx={{ fontWeight: 600 }}>A</ToggleButton>
          </ToggleButtonGroup>
        );
      }
    }
  ];

  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 2 } }}>
      {/* FILTER */}
      <Card sx={{ mb: 1, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* Pilih Tanggal */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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

          {/* Bagian Pilih Kelas (Beda tampilan Admin vs Guru) */}
          {isAdmin ? (
            // --- TAMPILAN ADMIN: Dropdown ---
            <Grid size={{ xs: 6, sm: 6, md: 3 }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Pilih Kelas</InputLabel>
                <Select 
                  value={selectedKelas} 
                  label="Pilih Kelas" 
                  onChange={(e) => setSelectedKelas(e.target.value)}
                >
                   {kelasOptions.map((k) => (
                      <MenuItem key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </MenuItem>
                   ))}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            // --- TAMPILAN GURU: Read Only Field ---
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              {myWaliKelasInfo ? (
                <TextField
                  label="Kelas Perwalian"
                  size="small"
                  fullWidth
                  value={myWaliKelasInfo.nama} 
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'primary.main' } }}
                />
              ) : (
                <Alert severity="warning" sx={{ py: 0, alignItems: 'center', fontSize: '0.8rem' }}>
                   Anda belum diatur sebagai Wali Kelas
                </Alert>
              )}
            </Grid>
          )}
          
          {/* Tombol Tampilkan (Hanya Admin yang butuh klik manual) */}
          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan}>
                Tampilkan
              </Button>
            </Grid>
          )}

        </Grid>
      </Card>

      {/* DATA GRID */}
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
                  Absensi Harian
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
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
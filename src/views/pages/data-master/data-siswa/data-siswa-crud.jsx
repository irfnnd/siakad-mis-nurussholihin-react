import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  Paper,
  InputAdornment,
  AppBar,
  Toolbar,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

// --- IMPORT API ---
import api from '../../../../services/api';

const SiswaCRUD = () => {
  const theme = useTheme();

  // State management
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('Semua');
  const [selectedKelamin, setSelectedKelamin] = useState('Semua');

  // --- FETCH DATA DARI BACKEND ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/siswa');

      // Ambil data siswa dari struktur JSON backend
      const dataSiswa = response.data?.data?.siswa || [];

      setStudents(dataSiswa);
      setFilteredStudents(dataSiswa);
    } catch (error) {
      console.error('Error fetching students:', error);
      setSnackbar({ open: true, message: 'Gagal memuat data siswa', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data di frontend
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          (student.nama_lengkap && student.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase())) ||
          // Cek kelas (bisa string atau object)
          (student.kelas &&
            (typeof student.kelas === 'string'
              ? student.kelas.toLowerCase().includes(searchTerm.toLowerCase())
              : student.kelas.nama_kelas?.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedKelas !== 'Semua') {
      filtered = filtered.filter((student) => {
        if (!student.kelas) return false;
        const namaKelas = typeof student.kelas === 'string' ? student.kelas : student.kelas.nama_kelas;
        return namaKelas === selectedKelas;
      });
    }

    if (selectedKelamin !== 'Semua') {
      filtered = filtered.filter((student) => student.jenis_kelamin === selectedKelamin);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedKelas, selectedKelamin, students]);

  // Handler functions
  const handleClickAdd = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setOpenFormDialog(true);
  };

  const handleClickEdit = (student) => {
    setIsEditMode(true);
    setSelectedStudent(student);
    setOpenFormDialog(true);
  };

  const handleClickView = (student) => {
    setSelectedStudent(student);
    setOpenDetailDialog(true);
  };

  const handleClickDelete = (student) => {
    setSelectedStudent(student);
    setOpenConfirmDialog(true);
  };

  const handleCloseForm = () => {
    setOpenFormDialog(false);
    setSelectedStudent(null);
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedStudent(null);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmDialog(false);
    setSelectedStudent(null);
  };

  // --- HANDLE SUBMIT (CREATE/UPDATE) ---
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const studentData = Object.fromEntries(formData.entries());

    try {
      setLoading(true);

      if (isEditMode) {
        // --- UPDATE ---
        const response = await api.put(`/siswa/${selectedStudent.id}`, studentData);
        const updatedStudent = response.data.data || response.data;

        // Update state lokal (gabungkan data lama dengan update baru)
        setStudents(students.map((s) => (s.id === selectedStudent.id ? { ...s, ...updatedStudent } : s)));
        setSnackbar({ open: true, message: 'Data siswa berhasil diperbarui', severity: 'success' });
      } else {
        // --- CREATE ---
        const response = await api.post('/siswa', studentData);
        // Refresh data penuh agar relasi kelas terbaru termuat
        fetchData();
        setSnackbar({ open: true, message: 'Siswa baru berhasil ditambahkan', severity: 'success' });
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving student:', error);
      const errMsg = error.response?.data?.message || 'Gagal menyimpan data';
      setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE DELETE ---
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/siswa/${selectedStudent.id}`);

      setStudents(students.filter((s) => s.id !== selectedStudent.id));
      setSnackbar({ open: true, message: 'Data siswa berhasil dihapus', severity: 'success' });
      handleCloseConfirm();
    } catch (error) {
      console.error('Error deleting student:', error);
      setSnackbar({ open: true, message: 'Gagal menghapus data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Kolom DataGrid
  const columns = [
    {
      field: 'nis',
      headerName: 'NIS',
      width: 200
    },
    {
      field: 'nama_lengkap', // Sesuai JSON backend
      headerName: 'Nama Siswa',
      flex: 1,
      minWidth: 200,
      sx: { fontWeight: 'bold' }
    },
    {
      field: 'kelas',
      headerName: 'Kelas',
      flex: 1,
      minWidth: 100,
      valueGetter: (value, row) => {
        const rowData = row || value?.row;

        if (!rowData) return '-';

        const kelas = rowData.kelas;

        // --- PERBAIKAN UTAMA ---
        // 1. Cek apakah data adalah Array (Sesuai JSON Anda)
        if (Array.isArray(kelas)) {
          // Jika array ada isinya, ambil nama_kelas dari item pertama
          if (kelas.length > 0) {
            return kelas[0].nama_kelas || '-';
          }
          // Jika array kosong [], berarti belum punya kelas
          return '-';
        }

        // 2. Fallback jika data adalah Object tunggal
        if (kelas && typeof kelas === 'object') {
          return kelas.nama_kelas || kelas.nama || '-';
        }

        // 3. Fallback jika data adalah String
        return kelas || '-';
      }
    },
    {
      field: 'jenis_kelamin', // Sesuai JSON backend
      headerName: 'Jenis Kelamin',
      flex: 1,
      minWidth: 50
    },
    {
      field: 'alamat', // Sesuai JSON backend
      headerName: 'Alamat',
      flex: 1,
      minWidth: 50
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'Aktif' ? 'success' : 'error'} />
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Lihat Detail">
            <IconButton onClick={() => handleClickView(params.row)} color="info" size="small">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleClickEdit(params.row)} color="primary" size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton onClick={() => handleClickDelete(params.row)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Konten Data Siswa */}
      <Box>
        {/* Filter dan Pencarian */}
        <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
          <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 5.8 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 1.6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Jenis Kelamin</InputLabel>
                <Select value={selectedKelamin} label="Filter Jenis Kelamin" onChange={(e) => setSelectedKelamin(e.target.value)}>
                  <MenuItem value="Semua">Semua</MenuItem>
                  <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                  <MenuItem value="Perempuan">Perempuan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedKelas('Semua');
                  setSelectedStatus('Semua');
                }}
              >
                Reset
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 1.6 }}>
              <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 1.8 }}>
              <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
                Tambah
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Tabel Data */}
        <Card sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={filteredStudents}
              columns={columns}
              loading={loading}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } }
              }}
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:hover': {
                  backgroundColor: 'action.hover'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'grey.100'
                }
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* Dialog Form Tambah/Edit */}
      <Dialog open={openFormDialog} onClose={handleCloseForm} maxWidth="md" TransitionComponent={Fade}>
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <PersonIcon />
          {isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              {/* NIS */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="nis"
                  label="NIS"
                  defaultValue={selectedStudent?.nis || ''}
                  fullWidth
                  required
                  disabled={isEditMode}
                  size="small"
                />
              </Grid>

              {/* NISN */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField name="nisn" label="NISN" defaultValue={selectedStudent?.nisn || ''} fullWidth required size="small" />
              </Grid>

              {/* Nama Lengkap (SESUAI JSON BACKEND) */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="nama_lengkap"
                  label="Nama Lengkap"
                  defaultValue={selectedStudent?.nama_lengkap || ''}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* Kelas */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Kelas</InputLabel>
                  <Select
                    name="kelas"
                    label="Kelas"
                    // Handle defaultValue untuk string atau object
                    defaultValue={
                      selectedStudent?.kelas
                        ? typeof selectedStudent.kelas === 'string'
                          ? selectedStudent.kelas
                          : selectedStudent.kelas.nama_kelas
                        : ''
                    }
                  >
                    <MenuItem value="10A">10A</MenuItem>
                    <MenuItem value="10B">10B</MenuItem>
                    <MenuItem value="11A">11A</MenuItem>
                    <MenuItem value="11B">11B</MenuItem>
                    <MenuItem value="12A">12A</MenuItem>
                    <MenuItem value="12B">12B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Jenis Kelamin (SESUAI JSON BACKEND) */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Jenis Kelamin</InputLabel>
                  <Select size="small" name="jenis_kelamin" label="Jenis Kelamin" defaultValue={selectedStudent?.jenis_kelamin || ''}>
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue={selectedStudent?.email || ''}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Telepon Orang Tua (SESUAI JSON BACKEND) */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="telepon_ortu"
                  label="Telepon Orang Tua"
                  defaultValue={selectedStudent?.telepon_ortu || ''}
                  fullWidth
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Tanggal Lahir (SESUAI JSON BACKEND) */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="tanggal_lahir"
                  label="Tanggal Lahir"
                  type="date"
                  defaultValue={selectedStudent?.tanggal_lahir ? selectedStudent.tanggal_lahir.split('T')[0] : ''}
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Status */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedStudent?.status || 'Aktif'}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Alamat */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  name="alamat"
                  label="Alamat Lengkap"
                  defaultValue={selectedStudent?.alamat || ''}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseForm} variant="outlined">
              Batal
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : isEditMode ? 'Perbarui Data' : 'Simpan Siswa'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Detail Siswa */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle
          sx={{
            bgcolor: 'info.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <VisibilityIcon />
          Detail Siswa
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem'
                  }}
                >
                  {selectedStudent.nama_lengkap
                    ? selectedStudent.nama_lengkap
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : 'S'}
                </Avatar>
                <Typography variant="h5" fontWeight="600">
                  {selectedStudent.nama_lengkap}
                </Typography>
                <Typography variant="h5" fontWeight="600">
                  <Chip
                    label={`Kelas: ${
                      // Cek jika array dan ada isinya
                      Array.isArray(selectedStudent.kelas) && selectedStudent.kelas.length > 0 ? selectedStudent.kelas[0].nama_kelas : '-'
                    }`}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    NIS
                  </Typography>
                  <Typography fontWeight="500">{selectedStudent.nis}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    NISN
                  </Typography>
                  <Typography fontWeight="500">{selectedStudent.nisn}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Jenis Kelamin
                  </Typography>
                  <Typography fontWeight="500">{selectedStudent.jenis_kelamin}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedStudent.status} size="small" color={selectedStudent.status === 'Aktif' ? 'success' : 'error'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Telepon Orang Tua/Wali
                  </Typography>
                  <Typography fontWeight="500">{selectedStudent.telepon_ortu || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Alamat
                  </Typography>
                  <Typography fontWeight="500">{selectedStudent.alamat || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetail} variant="outlined">
            Tutup
          </Button>
          <Button
            onClick={() => {
              handleCloseDetail();
              handleClickEdit(selectedStudent);
            }}
            variant="contained"
          >
            Edit Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm} TransitionComponent={Fade}>
        <DialogTitle sx={{ color: 'error.main' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tindakan ini tidak dapat dibatalkan!
          </Alert>
          <Typography>
            Apakah Anda yakin ingin menghapus data siswa <strong>{selectedStudent?.nama_lengkap}</strong> (NIS: {selectedStudent?.nis})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk Notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiswaCRUD;

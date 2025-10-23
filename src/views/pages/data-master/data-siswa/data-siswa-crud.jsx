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

// Data dummy
const initialRows = [
  { 
    id: 1,
    nis: '1001', 
    nisn: '0012345678', 
    nama: 'Budi Santoso', 
    kelas: '10A', 
    jenisKelamin: 'Laki-laki', 
    alamat: 'Jl. Merdeka No. 1, Jakarta',
    email: 'budi.santoso@email.com',
    telepon: '081234567890',
    tanggalLahir: '2007-05-15',
    agama: 'Islam',
    status: 'Aktif',
    tanggalMasuk: '2023-07-15',
    foto: '/avatars/1.jpg'
  },
  { 
    id: 2,
    nis: '1002', 
    nisn: '0012345679', 
    nama: 'Ani Yudhoyono', 
    kelas: '10B', 
    jenisKelamin: 'Perempuan', 
    alamat: 'Jl. Pahlawan No. 2, Bandung',
    email: 'ani.yudhoyono@email.com',
    telepon: '081234567891',
    tanggalLahir: '2007-08-20',
    agama: 'Kristen',
    status: 'Aktif',
    tanggalMasuk: '2023-07-15',
    foto: '/avatars/2.jpg'
  },
  // ... data lainnya
];


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
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Simulasi pengambilan data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStudents(initialRows);
        setFilteredStudents(initialRows);
        setSnackbar({ open: true, message: 'Data berhasil dimuat', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Gagal memuat data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data berdasarkan pencarian dan filter
  useEffect(() => {
    let filtered = students;
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.kelas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedKelas !== 'Semua') {
      filtered = filtered.filter(student => student.kelas === selectedKelas);
    }
    
    if (selectedStatus !== 'Semua') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, selectedKelas, selectedStatus, students]);

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newStudentData = {
      id: isEditMode ? selectedStudent.id : Date.now(),
      nis: formData.get('nis'),
      nisn: formData.get('nisn'),
      nama: formData.get('nama'),
      kelas: formData.get('kelas'),
      jenisKelamin: formData.get('jenisKelamin'),
      alamat: formData.get('alamat'),
      email: formData.get('email'),
      telepon: formData.get('telepon'),
      tanggalLahir: formData.get('tanggalLahir'),
      agama: formData.get('agama'),
      status: formData.get('status'),
      tanggalMasuk: formData.get('tanggalMasuk'),
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditMode) {
        setStudents(students.map(s => s.id === selectedStudent.id ? newStudentData : s));
        setSnackbar({ open: true, message: 'Data siswa berhasil diperbarui', severity: 'success' });
      } else {
        setStudents([...students, newStudentData]);
        setSnackbar({ open: true, message: 'Siswa baru berhasil ditambahkan', severity: 'success' });
      }
      handleCloseForm();
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal menyimpan data', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudents(students.filter(s => s.id !== selectedStudent.id));
      setSnackbar({ open: true, message: 'Data siswa berhasil dihapus', severity: 'success' });
      handleCloseConfirm();
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal menghapus data', severity: 'error' });
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ open: true, message: 'Data diperbarui', severity: 'info' });
    }, 1500);
  };

  // Kolom DataGrid
  const columns = [
    { 
      field: 'nis', 
      headerName: 'NIS', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'nama', 
      headerName: 'Nama Siswa', 
      flex: 1,
      minWidth: 200,
    },
    { field: 'kelas', headerName: 'Kelas', flex: 1, minWidth: 100 },
    { 
      field: 'jenisKelamin', 
      headerName: 'Jenis Kelamin', 
      flex: 1,
      minWidth: 50,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'Laki-laki' ? 'L' : 'P'} 
          size="small"
          color={params.value === 'Laki-laki' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          size="small"
          color={params.value === 'Aktif' ? 'success' : 'error'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Lihat Detail">
            <IconButton 
              onClick={() => handleClickView(params.row)} 
              color="info" 
              size="small"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              onClick={() => handleClickEdit(params.row)} 
              color="primary" 
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton 
              onClick={() => handleClickDelete(params.row)} 
              color="error" 
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: 3 }}>
      {/* Konten Data Siswa */}
      <Box>
        {/* Header dengan Actions */}

        {/* Filter dan Pencarian */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} flex={1} md={4}>
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
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Kelas</InputLabel>
                <Select
                  value={selectedKelas}
                  label="Filter Kelas"
                  onChange={(e) => setSelectedKelas(e.target.value)}
                >
                  <MenuItem value="Semua">Semua Kelas</MenuItem>
                  <MenuItem value="10A">10A</MenuItem>
                  <MenuItem value="10B">10B</MenuItem>
                  <MenuItem value="11A">11A</MenuItem>
                  <MenuItem value="11B">11B</MenuItem>
                  <MenuItem value="12A">12A</MenuItem>
                  <MenuItem value="12B">12B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Filter Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="Semua">Semua Status</MenuItem>
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
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
            <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
              <Button 
                fullWidth
                variant="outlined" 
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>

            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button 
                fullWidth
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleClickAdd}
              >
                Tambah Siswa
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Tabel Data */}
        <Card sx={{p:2}}>
            <Paper sx={{ width: '100%' }}>
              <DataGrid
                rows={filteredStudents}
                columns={columns}
                loading={loading}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'grey.100',
                  }
                }}
              />
            </Paper>
        </Card>
      </Box>

      {/* Dialog Form Tambah/Edit */}
      <Dialog 
        open={openFormDialog} 
        onClose={handleCloseForm} 
        maxWidth="md"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
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
          <TextField
            name="nisn"
            label="NISN"
            defaultValue={selectedStudent?.nisn || ''}
            fullWidth
            required
            size="small"
          />
        </Grid>

        {/* Nama Lengkap */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            name="nama"
            label="Nama Lengkap"
            defaultValue={selectedStudent?.nama || ''}
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
              defaultValue={selectedStudent?.kelas || ''}
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

        {/* Jenis Kelamin */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth required size="small">
            <InputLabel>Jenis Kelamin</InputLabel>
            <Select
              size='small'
              name="jenisKelamin"
              label="Jenis Kelamin"
              defaultValue={selectedStudent?.jenisKelamin || ''}
            >
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
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Telepon */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            name="telepon"
            label="Telepon"
            defaultValue={selectedStudent?.telepon || ''}
            fullWidth
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Tanggal Lahir */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            name="tanggalLahir"
            label="Tanggal Lahir"
            type="date"
            defaultValue={selectedStudent?.tanggalLahir || ''}
            fullWidth
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Agama */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth required size="small">
            <InputLabel>Agama</InputLabel>
            <Select
              name="agama"
              label="Agama"
              defaultValue={selectedStudent?.agama || ''}
            >
              <MenuItem value="Islam">Islam</MenuItem>
              <MenuItem value="Kristen">Kristen</MenuItem>
              <MenuItem value="Katolik">Katolik</MenuItem>
              <MenuItem value="Hindu">Hindu</MenuItem>
              <MenuItem value="Buddha">Buddha</MenuItem>
              <MenuItem value="Konghucu">Konghucu</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Tanggal Masuk */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            name="tanggalMasuk"
            label="Tanggal Masuk"
            type="date"
            defaultValue={selectedStudent?.tanggalMasuk || ''}
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
            <Select
              name="status"
              label="Status"
              defaultValue={selectedStudent?.status || 'Aktif'}
            >
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
            <Button onClick={handleCloseForm} variant="outlined">Batal</Button>
            <Button type="submit" variant="contained" size="large">
              {isEditMode ? 'Perbarui Data' : 'Simpan Siswa'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Detail Siswa */}
      <Dialog 
          open={openDetailDialog} 
          onClose={handleCloseDetail} 
          fullWidth 
          maxWidth="sm"
          TransitionComponent={Fade}
      >
          <DialogTitle sx={{ 
              bgcolor: 'info.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
          }}>
              <VisibilityIcon />
              Detail Siswa
          </DialogTitle>
          <DialogContent>
              {selectedStudent && (
                  <Box sx={{ pt: 3 }}>
                      {/* Bagian Header dengan Avatar dan Nama */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                          <Avatar sx={{ 
                              width: 100, 
                              height: 100, 
                              mb: 2, 
                              bgcolor: 'primary.main',
                              fontSize: '2.5rem'
                          }}>
                              {selectedStudent.nama.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="h5" fontWeight="600">{selectedStudent.nama}</Typography>
                          <Chip label={`Kelas: ${selectedStudent.kelas}`} color="primary" sx={{ mt: 1 }} />
                      </Box>
                      
                      {/* Bagian Informasi Detail */}
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">NIS</Typography>
                              <Typography fontWeight="500">{selectedStudent.nis}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">NISN</Typography>
                              <Typography fontWeight="500">{selectedStudent.nisn}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Jenis Kelamin</Typography>
                              <Typography fontWeight="500">{selectedStudent.jenisKelamin}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip 
                                  label={selectedStudent.status} 
                                  size="small" 
                                  color={selectedStudent.status === 'Aktif' ? 'success' : 'error'} 
                              />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Email Orang Tua/Wali</Typography>
                              <Typography fontWeight="500">{selectedStudent.email || '-'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Telepon Orang Tua/Wali</Typography>
                              <Typography fontWeight="500">{selectedStudent.telepon || '-'}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Alamat</Typography>
                              <Typography fontWeight="500">{selectedStudent.alamat}</Typography>
                          </Grid>
                      </Grid>
                  </Box>
              )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDetail} variant="outlined">Tutup</Button>
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
            Apakah Anda yakin ingin menghapus data siswa <strong>{selectedStudent?.nama}</strong> (NIS: {selectedStudent?.nis})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Ya, Hapus
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
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiswaCRUD;
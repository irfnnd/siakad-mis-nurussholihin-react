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
  InputAdornment,
  AppBar,
  Toolbar,
  Fade,
  useTheme
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
import BadgeIcon from '@mui/icons-material/Badge';

// Data dummy untuk Guru & Staf
const initialRows = [
  {
    id: 1,
    nip: '198503152010011001',
    nuptk: '1234567890123456',
    nama: 'Dr. Ahmad Subagyo, M.Pd.',
    jabatan: 'Kepala Sekolah',
    jenisKelamin: 'Laki-laki',
    alamat: 'Jl. Pendidikan No. 10, Jakarta',
    email: 'ahmad.s@sekolah.id',
    telepon: '081298765432',
    tanggalLahir: '1985-03-15',
    agama: 'Islam',
    status: 'Aktif',
    tanggalMasuk: '2010-01-15'
  },
  {
    id: 2,
    nip: '199008202015032002',
    nuptk: '2345678901234567',
    nama: 'Siti Aminah, S.Pd.',
    jabatan: 'Guru Matematika',
    jenisKelamin: 'Perempuan',
    alamat: 'Jl. Cendekia No. 5, Bandung',
    email: 'siti.aminah@sekolah.id',
    telepon: '081312345678',
    tanggalLahir: '1990-08-20',
    agama: 'Islam',
    status: 'Aktif',
    tanggalMasuk: '2015-03-01'
  },
  {
    id: 3,
    nip: '199205102018011005',
    nuptk: '3456789012345678',
    nama: 'Bambang Pamungkas',
    jabatan: 'Staf Tata Usaha',
    jenisKelamin: 'Laki-laki',
    alamat: 'Jl. Administrasi No. 1, Surabaya',
    email: 'bambang.tu@sekolah.id',
    telepon: '081567891234',
    tanggalLahir: '1992-05-10',
    agama: 'Kristen',
    status: 'Aktif',
    tanggalMasuk: '2018-01-20'
  }
];

const GuruStafCRUD = () => {
  const theme = useTheme();

  // State management
  const [pegawai, setPegawai] = useState([]);
  const [filteredPegawai, setFilteredPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Simulasi pengambilan data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setPegawai(initialRows);
        setFilteredPegawai(initialRows);
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
    let filtered = pegawai;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedJabatan !== 'Semua') {
      filtered = filtered.filter((p) => p.jabatan === selectedJabatan);
    }

    if (selectedStatus !== 'Semua') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    setFilteredPegawai(filtered);
  }, [searchTerm, selectedJabatan, selectedStatus, pegawai]);

  // Handler functions
  const handleClickAdd = () => {
    setIsEditMode(false);
    setSelectedPegawai(null);
    setOpenFormDialog(true);
  };

  const handleClickEdit = (p) => {
    setIsEditMode(true);
    setSelectedPegawai(p);
    setOpenFormDialog(true);
  };

  const handleClickView = (p) => {
    setSelectedPegawai(p);
    setOpenDetailDialog(true);
  };

  const handleClickDelete = (p) => {
    setSelectedPegawai(p);
    setOpenConfirmDialog(true);
  };

  const handleCloseForm = () => setOpenFormDialog(false);
  const handleCloseDetail = () => setOpenDetailDialog(false);
  const handleCloseConfirm = () => setOpenConfirmDialog(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newPegawaiData = {
      id: isEditMode ? selectedPegawai.id : Date.now(),
      nip: formData.get('nip'),
      nuptk: formData.get('nuptk'),
      nama: formData.get('nama'),
      jabatan: formData.get('jabatan'),
      jenisKelamin: formData.get('jenisKelamin'),
      alamat: formData.get('alamat'),
      email: formData.get('email'),
      telepon: formData.get('telepon'),
      tanggalLahir: formData.get('tanggalLahir'),
      agama: formData.get('agama'),
      status: formData.get('status'),
      tanggalMasuk: formData.get('tanggalMasuk')
    };

    if (isEditMode) {
      setPegawai(pegawai.map((p) => (p.id === selectedPegawai.id ? newPegawaiData : p)));
      setSnackbar({ open: true, message: 'Data pegawai berhasil diperbarui', severity: 'success' });
    } else {
      setPegawai([...pegawai, newPegawaiData]);
      setSnackbar({ open: true, message: 'Pegawai baru berhasil ditambahkan', severity: 'success' });
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    setPegawai(pegawai.filter((p) => p.id !== selectedPegawai.id));
    setSnackbar({ open: true, message: 'Data pegawai berhasil dihapus', severity: 'success' });
    handleCloseConfirm();
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Kolom DataGrid
  const columns = [
    {
      field: 'nip',
      headerName: 'NIP',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'nama',
      headerName: 'Nama Guru & Staf',
      flex: 1,
      minWidth: 250
    },
    { field: 'jabatan', headerName: 'Jabatan', width: 200 },
    { field: 'telepon', headerName: 'Telepon', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
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
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box>
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11} flex={1} md={4}>
              <TextField
                fullWidth
                placeholder="Cari guru/staf..."
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Jabatan</InputLabel>
                <Select value={selectedJabatan} label="Filter Jabatan" onChange={(e) => setSelectedJabatan(e.target.value)}>
                  <MenuItem value="Semua">Semua Jabatan</MenuItem>
                  <MenuItem value="Kepala Sekolah">Kepala Sekolah</MenuItem>
                  <MenuItem value="Guru Matematika">Guru Matematika</MenuItem>
                  <MenuItem value="Staf Tata Usaha">Staf Tata Usaha</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Status</InputLabel>
                <Select value={selectedStatus} label="Filter Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                  <MenuItem value="Semua">Semua Status</MenuItem>
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedJabatan('Semua');
                  setSelectedStatus('Semua');
                }}
              >
                Reset
              </Button>
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<CloudUploadIcon />}>
                Import
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
                Tambah Pegawai
              </Button>
            </Box>
          </Grid>
        </Card>

        <Card sx={{ p: 2 }}> 
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={filteredPegawai}
              columns={columns}
              loading={loading}
              pageSizeOptions={[5,10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{ border: 0 }}
            />
          </Box>
        </Card>
      </Box>

      {/* Dialog Form Tambah/Edit */}
      <Dialog open={openFormDialog} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {isEditMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField name="nama" label="Nama Lengkap" defaultValue={selectedPegawai?.nama || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="nip" label="NIP" defaultValue={selectedPegawai?.nip || ''} fullWidth required disabled={isEditMode} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="nuptk" label="NUPTK (Opsional)" defaultValue={selectedPegawai?.nuptk || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tanggalLahir"
                  label="Tanggal Lahir"
                  type="date"
                  defaultValue={selectedPegawai?.tanggalLahir || ''}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Jenis Kelamin</InputLabel>
                  <Select name="jenisKelamin" label="Jenis Kelamin" defaultValue={selectedPegawai?.jenisKelamin || ''}>
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="jabatan" label="Jabatan" defaultValue={selectedPegawai?.jabatan || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Agama</InputLabel>
                  <Select name="agama" label="Agama" defaultValue={selectedPegawai?.agama || ''}>
                    <MenuItem value="Islam">Islam</MenuItem>
                    <MenuItem value="Kristen">Kristen</MenuItem>
                    <MenuItem value="Katolik">Katolik</MenuItem>
                    <MenuItem value="Hindu">Hindu</MenuItem>
                    <MenuItem value="Buddha">Buddha</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tanggalMasuk"
                  label="Tanggal Masuk"
                  type="date"
                  defaultValue={selectedPegawai?.tanggalMasuk || ''}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedPegawai?.status || 'Aktif'}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue={selectedPegawai?.email || ''}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="telepon"
                  label="Telepon"
                  defaultValue={selectedPegawai?.telepon || ''}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField name="alamat" label="Alamat" defaultValue={selectedPegawai?.alamat || ''} fullWidth multiline rows={3} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Detail Pegawai */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>Detail Pegawai</DialogTitle>

        <DialogContent>
          {selectedPegawai && (
            <Grid container spacing={3}>
              {/* Header Section */}
              <Grid sx={{ textAlign: 'center', pb: 2, pt: 2 }} size={{ xs: 12 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {selectedPegawai.nama
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Avatar>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  {selectedPegawai.nama}
                </Typography>
                <Chip label={selectedPegawai.jabatan} color="primary" size="medium" sx={{ mt: 1 }} />
              </Grid>

              {/* Detail Information */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  NIP
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.nip}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  NUPTK
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.nuptk}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Jenis Kelamin
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.jenisKelamin}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={selectedPegawai.status}
                  size="small"
                  color={selectedPegawai.status === 'Aktif' ? 'success' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.email}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Telepon
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.telepon}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Alamat
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {selectedPegawai.alamat}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDetail} variant="contained">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
                Tindakan ini tidak dapat dibatalkan!
            </Alert>
          <Typography>
            Apakah Anda yakin ingin menghapus data <strong>{selectedPegawai?.nama}</strong> (NIP: {selectedPegawai?.nip})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GuruStafCRUD;

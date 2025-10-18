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
  Chip,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

// Data dummy untuk Pegawai
const initialRows = [
  {
    id: 1,
    nip: '3201234567890001',
    nama: 'Dr. Ahmad Subagyo, M.Kom.',
    jabatan: 'Direktur Utama',
    jenisKelamin: 'Laki-laki',
    alamat: 'Jl. Jenderal Sudirman No. 10, Jakarta',
    email: 'ahmad.s@perusahaan.com',
    telepon: '081298765432',
    tanggalLahir: '1985-03-15',
    agama: 'Islam',
    status: 'Aktif',
    tanggalMasuk: '2010-01-15'
  },
  {
    id: 2,
    nip: '3201234567890002',
    nama: 'Siti Aminah, S.E.',
    jabatan: 'Manajer Keuangan',
    jenisKelamin: 'Perempuan',
    alamat: 'Jl. MH Thamrin No. 5, Jakarta',
    email: 'siti.aminah@perusahaan.com',
    telepon: '081312345678',
    tanggalLahir: '1990-08-20',
    agama: 'Islam',
    status: 'Aktif',
    tanggalMasuk: '2015-03-01'
  },
  {
    id: 3,
    nip: '3201234567890003',
    nama: 'Bambang Pamungkas',
    jabatan: 'Staf IT',
    jenisKelamin: 'Laki-laki',
    alamat: 'Jl. Gatot Subroto No. 1, Jakarta',
    email: 'bambang.it@perusahaan.com',
    telepon: '081567891234',
    tanggalLahir: '1992-05-10',
    agama: 'Kristen',
    status: 'Cuti',
    tanggalMasuk: '2018-01-20'
  }
];

const PegawaiCRUD = () => {
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPegawaiData = {
      id: isEditMode ? selectedPegawai.id : Date.now(),
      nip: formData.get('nip'),
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

  const handleConfirmDelete = () => {
    setPegawai(pegawai.filter((p) => p.id !== selectedPegawai.id));
    setSnackbar({ open: true, message: 'Data pegawai berhasil dihapus', severity: 'success' });
    handleCloseConfirm();
  };

  // Kolom DataGrid
  const columns = [
    {
      field: 'nip',
      headerName: 'NIP / ID Pegawai',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'nama',
      headerName: 'Nama Pegawai',
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
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Aktif' ? 'success' : params.value === 'Cuti' ? 'warning' : 'error'}
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
    <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={11} flex={1} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari pegawai berdasarkan nama, NIP, jabatan..."
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
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Jabatan</InputLabel>
              <Select value={selectedJabatan} label="Filter Jabatan" onChange={(e) => setSelectedJabatan(e.target.value)}>
                <MenuItem value="Semua">Semua Jabatan</MenuItem>
                <MenuItem value="Direktur Utama">Direktur Utama</MenuItem>
                <MenuItem value="Manajer Keuangan">Manajer Keuangan</MenuItem>
                <MenuItem value="Staf IT">Staf IT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select value={selectedStatus} label="Filter Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                <MenuItem value="Semua">Semua Status</MenuItem>
                <MenuItem value="Aktif">Aktif</MenuItem>
                <MenuItem value="Cuti">Cuti</MenuItem>
                <MenuItem value="Nonaktif">Nonaktif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedJabatan('Semua');
                setSelectedStatus('Semua');
              }}
            >
              Reset
            </Button>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
              Tambah Pegawai
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 2 }}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={filteredPegawai}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ border: 0 }}
          />
        </Box>
      </Card>

      {/* Dialog Form Tambah/Edit */}
      <Dialog open={openFormDialog} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>{isEditMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="nama" label="Nama Lengkap" defaultValue={selectedPegawai?.nama || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="nip"
                  label="nip / ID Pegawai"
                  defaultValue={selectedPegawai?.nip || ''}
                  fullWidth
                  required
                  disabled={isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="jabatan" label="Jabatan" defaultValue={selectedPegawai?.jabatan || ''} fullWidth required />
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
                <TextField name="email" label="Email" type="email" defaultValue={selectedPegawai?.email || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="telepon" label="Telepon" defaultValue={selectedPegawai?.telepon || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tanggalMasuk"
                  label="Tanggal Masuk"
                  type="date"
                  defaultValue={selectedPegawai?.tanggalMasuk || new Date().toISOString().split('T')[0]}
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
                    <MenuItem value="Cuti">Cuti</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
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
        <DialogTitle>Detail Pegawai</DialogTitle>
        <DialogContent>
          {selectedPegawai && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
                  {selectedPegawai.nama
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Avatar>
                <Typography variant="h5">{selectedPegawai.nama}</Typography>
                <Chip label={selectedPegawai.jabatan} color="primary" sx={{ mt: 1 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    nip
                  </Typography>
                  <Typography>{selectedPegawai.nip}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedPegawai.status} size="small" color={selectedPegawai.status === 'Aktif' ? 'success' : 'error'} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{selectedPegawai.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Telepon
                  </Typography>
                  <Typography>{selectedPegawai.telepon}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Alamat
                  </Typography>
                  <Typography>{selectedPegawai.alamat}</Typography>
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
              handleClickEdit(selectedPegawai);
            }}
            variant="contained"
          >
            Edit Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Tindakan ini tidak dapat dibatalkan!</Alert>
          <Typography sx={{ mt: 2 }}>Apakah Anda yakin ingin menghapus data **{selectedPegawai?.nama}**?</Typography>
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

export default PegawaiCRUD;

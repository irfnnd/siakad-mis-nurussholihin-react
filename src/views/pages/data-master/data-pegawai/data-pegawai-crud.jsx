import React, { useState, useEffect, useMemo } from 'react';
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
  InputAdornment,
  Fade,
  CircularProgress
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

// Import API
import api from '../../../../services/api'; // Pastikan path ini benar

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
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // --- 1. GENERATE OPSI FILTER DINAMIS ---
  const jabatanOptions = useMemo(() => {
    const jabatans = pegawai.map(p => p.jabatan).filter(j => j);
    return [...new Set(jabatans)].sort();
  }, [pegawai]);

  const statusOptions = useMemo(() => {
    const statuses = pegawai.map(p => p.status).filter(s => s);
    return [...new Set(statuses)].sort();
  }, [pegawai]);


  // --- FETCH DATA ---
  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pegawai');
      // Sesuaikan dengan JSON: response.data.data.pegawai
      const rawData = response.data?.data?.pegawai || response.data?.data || [];
      
      // Mapping data agar sesuai dengan kolom DataGrid (Flattening)
      const mappedData = rawData.map(p => ({
        ...p,
        nama: p.nama_lengkap, // Backend: nama_lengkap -> Frontend: nama
        email: p.user?.email || '-', // Ambil email dari relasi user
        status: p.user?.status || 'Nonaktif', // Ambil status dari relasi user
        // Handle field lain jika null di backend
        jenisKelamin: p.jenis_kelamin || '',
        tanggalLahir: p.tanggal_lahir || '',
        agama: p.agama || '',
        tanggalMasuk: p.tanggal_masuk || ''
      }));

      setPegawai(mappedData);
      setFilteredPegawai(mappedData);
    } catch (error) {
      console.error("Error fetching pegawai:", error);
      setSnackbar({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let filtered = pegawai;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          (p.nama && p.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.nip && p.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.jabatan && p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleCloseForm = () => {
    setOpenFormDialog(false);
    setSelectedPegawai(null);
  }
  const handleCloseDetail = () => setOpenDetailDialog(false);
  const handleCloseConfirm = () => setOpenConfirmDialog(false);

  // --- SUBMIT FORM ---
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    // Mapping payload untuk backend (snake_case biasanya)
    const payload = {
      nip: formData.get('nip'),
      nama_lengkap: formData.get('nama'), // Frontend 'nama' -> Backend 'nama_lengkap'
      jabatan: formData.get('jabatan'),
      jenis_kelamin: formData.get('jenisKelamin'),
      alamat: formData.get('alamat'),
      email: formData.get('email'),
      telepon: formData.get('telepon'),
      tanggal_lahir: formData.get('tanggalLahir'),
      agama: formData.get('agama'),
      status: formData.get('status'),
      tanggal_masuk: formData.get('tanggalMasuk')
    };

    try {
        if (isEditMode) {
            await api.put(`/pegawai/${selectedPegawai.id}`, payload);
            setSnackbar({ open: true, message: 'Data pegawai berhasil diperbarui', severity: 'success' });
        } else {
            await api.post('/pegawai', payload);
            setSnackbar({ open: true, message: 'Pegawai baru berhasil ditambahkan', severity: 'success' });
        }
        fetchPegawai(); // Refresh data
        handleCloseForm();
    } catch (error) {
        console.error("Error saving:", error);
        const errMsg = error.response?.data?.message || 'Gagal menyimpan data';
        setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  // --- DELETE ---
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
        await api.delete(`/pegawai/${selectedPegawai.id}`);
        setSnackbar({ open: true, message: 'Data pegawai berhasil dihapus', severity: 'success' });
        fetchPegawai(); // Refresh list
        handleCloseConfirm();
    } catch (error) {
        console.error("Error deleting:", error);
         const errMsg = error.response?.data?.message || 'Gagal menghapus data';
        setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
        setLoading(false);
    }
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
      field: 'nama', // Menggunakan field hasil mapping di fetchPegawai
      headerName: 'Nama Pegawai',
      flex: 1,
      minWidth: 250
    },
    { field: 'jabatan', headerName: 'Jabatan', width: 200 },
    { field: 'telepon', headerName: 'Telepon', width: 150 },
    { field: 'alamat', headerName: 'Alamat', width: 200 },
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
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: 'grey.50' }}>
      <Card sx={{ mb:{ xs: 1, sm: 1.5, md: 3 }, p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">
          
          {/* Menggunakan size={{...}} sesuai permintaan */}
          <Grid size={{ xs: 12, md: 4.2 }} >
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

          {/* Filter Jabatan Dinamis */}
          <Grid size={{ xs: 6, md: 1.7 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Jabatan</InputLabel>
              <Select value={selectedJabatan} label="Filter Jabatan" onChange={(e) => setSelectedJabatan(e.target.value)}>
                <MenuItem value="Semua">Semua Jabatan</MenuItem>
                {jabatanOptions.map((jabatan) => (
                  <MenuItem key={jabatan} value={jabatan}>{jabatan}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filter Status Dinamis */}
          <Grid size={{ xs: 6, md: 1.7 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select value={selectedStatus} label="Filter Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                <MenuItem value="Semua">Semua Status</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{xs: 6, md: 1.3}}>
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
          <Grid size={{ xs: 6, md: 1.5 }}>
            <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }} >
            <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
              Tambah
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p:{ xs: 1, sm: 2, md: 3} }}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={filteredPegawai}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            autoHeight
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
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField name="nama" label="Nama Lengkap" defaultValue={selectedPegawai?.nama || ''} fullWidth required />
              </Grid>
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField
                  name="nip"
                  label="NIP / ID Pegawai"
                  defaultValue={selectedPegawai?.nip || ''}
                  fullWidth
                  required
                  disabled={isEditMode} 
                />
              </Grid>
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField name="jabatan" label="Jabatan" defaultValue={selectedPegawai?.jabatan || ''} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Jenis Kelamin</InputLabel>
                  <Select name="jenisKelamin" label="Jenis Kelamin" defaultValue={selectedPegawai?.jenisKelamin || ''}>
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  name="tanggalLahir"
                  label="Tanggal Lahir"
                  type="date"
                  defaultValue={selectedPegawai?.tanggalLahir ? selectedPegawai.tanggalLahir.split('T')[0] : ''}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Agama</InputLabel>
                  <Select name="agama" label="Agama" defaultValue={selectedPegawai?.agama || ''}>
                    <MenuItem value="Islam">Islam</MenuItem>
                    <MenuItem value="Kristen">Kristen</MenuItem>
                    <MenuItem value="Katolik">Katolik</MenuItem>
                    <MenuItem value="Hindu">Hindu</MenuItem>
                    <MenuItem value="Buddha">Buddha</MenuItem>
                    <MenuItem value="Konghucu">Konghucu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField name="email" label="Email" type="email" defaultValue={selectedPegawai?.email || ''} fullWidth required />
              </Grid>
              <Grid size={{xs:12, sm:6, md:4}}>
                <TextField name="telepon" label="Telepon" defaultValue={selectedPegawai?.telepon || ''} fullWidth required />
              </Grid>
              <Grid size={{ xs: 7, md: 4 }}>
                <TextField
                  name="tanggalMasuk"
                  label="Tanggal Masuk"
                  type="date"
                  defaultValue={selectedPegawai?.tanggalMasuk ? selectedPegawai.tanggalMasuk.split('T')[0] : ''}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 5, md: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedPegawai?.status || 'Aktif'}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Cuti">Cuti</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, sm:12, md:8}}>
                <TextField name="alamat" label="Alamat" defaultValue={selectedPegawai?.alamat || ''} fullWidth multiline rows={3} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Perbarui' : 'Simpan')}
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
                    ? selectedPegawai.nama.charAt(0)
                    : 'P'}
                </Avatar>
                <Typography variant="h5">{selectedPegawai.nama}</Typography>
                <Chip label={selectedPegawai.jabatan} color="primary" sx={{ mt: 1 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid size={{xs:6, sm:4, md:6}}>
                  <Typography variant="body2" color="text.secondary">
                    NIP
                  </Typography>
                  <Typography>{selectedPegawai.nip}</Typography>
                </Grid>
                <Grid size={{xs:6, sm:4, md:6}}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedPegawai.status} size="small" color={selectedPegawai.status === 'Aktif' ? 'success' : 'error'} />
                </Grid>
                <Grid size={{xs:6, sm:4, md:6}}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{selectedPegawai.email}</Typography>
                </Grid>
                <Grid size={{xs:6, sm:4, md:6}}>
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
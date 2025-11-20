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
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  Fade
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// ICONS
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

import api from '../../../../services/api'; // Sesuaikan path import API Anda

const DataKelasCRUD = () => {
  const [kelas, setKelas] = useState([]);
  const [selectedTingkat, setSelectedTingkat] = useState('Semua');
  const [filteredKelas, setFilteredKelas] = useState([]);
  // State untuk dropdown Wali Kelas (Data Pegawai)
  const [pegawaiOptions, setPegawaiOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedKelasData, setSelectedKelasData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // --- FETCH DATA KELAS ---
  const fetchKelas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kelas');
      // Sesuai JSON: response.data.data.kelas
      const data = response.data?.data?.kelas || [];
      setKelas(data);
      setFilteredKelas(data);
      // setSnackbar({ open: true, message: 'Data kelas berhasil dimuat', severity: 'success' });
    } catch (error) {
      console.error('Error fetching kelas:', error);
      setSnackbar({ open: true, message: 'Gagal memuat data kelas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- FETCH DATA PEGAWAI (UNTUK DROPDOWN WALI KELAS) ---
  const fetchPegawai = async () => {
    try {
      // Pastikan endpoint /pegawai ada
      const response = await api.get('/pegawai'); 
      const dataPegawai = response.data?.data?.pegawai || response.data?.data || [];
      setPegawaiOptions(dataPegawai);
    } catch (error) {
      console.error('Error fetching pegawai:', error);
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchPegawai();
  }, []);

  // --- FILTER ---
  useEffect(() => {
    let filtered = kelas;
    if (searchTerm) {
      filtered = filtered.filter(k =>
        (k.nama_kelas && k.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (k.wali_kelas?.nama_lengkap && k.wali_kelas.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    // Filter status (Jika backend belum support status di tabel kelas, filter ini mungkin perlu disesuaikan)
    if (selectedStatus !== 'Semua') {
       // Asumsi ada field status, jika tidak ada di JSON, abaikan atau tambahkan default di backend
       if (k.status) filtered = filtered.filter(k => k.status === selectedStatus);
    }
    // Filter tingkat
    if (selectedTingkat !== 'Semua') {
      filtered = filtered.filter(k => String(k.tingkat) === String(selectedTingkat));
    }
    setFilteredKelas(filtered);
  }, [searchTerm, selectedStatus, kelas, selectedTingkat]);

  // --- HANDLERS ---
  const handleAdd = () => {
    setIsEditMode(false);
    setSelectedKelasData(null);
    setOpenFormDialog(true);
  };

  const handleEdit = (kelasData) => {
    setIsEditMode(true);
    setSelectedKelasData(kelasData);
    setOpenFormDialog(true);
  };

  const handleView = (kelasData) => {
    setSelectedKelasData(kelasData);
    setOpenDetailDialog(true);
  };

  const handleDelete = (kelasData) => {
    setSelectedKelasData(kelasData);
    setOpenConfirmDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenFormDialog(false);
    setOpenDetailDialog(false);
    setOpenConfirmDialog(false);
    setSelectedKelasData(null);
  };

  // --- SUBMIT FORM ---
  const handleFormSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const newData = {
        nama_kelas: formData.get('nama_kelas'), // Sesuai DB: nama_kelas
        tingkat: formData.get('tingkat'),       // Sesuai DB: tingkat
        wali_kelas_id: formData.get('wali_kelas_id'), // Kirim ID, bukan nama
        // Status opsional, kirim jika ada inputnya
        ...(formData.get('status') && { status: formData.get('status') })
      };

      try {
        setLoading(true);
        if (isEditMode) {
          await api.put(`/kelas/${selectedKelasData.id}`, newData);
          setSnackbar({ open: true, message: 'Data kelas berhasil diperbarui', severity: 'success' });
        } else {
          await api.post('/kelas', newData);
          setSnackbar({ open: true, message: 'Kelas baru berhasil ditambahkan', severity: 'success' });
        }
        
        fetchKelas(); 
        handleCloseDialogs();
        
      } catch (error) {
        console.error('Error submitting form:', error);
        const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
        setSnackbar({ open: true, message: errMsg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const handleConfirmDelete = async () => {
      try {
        setLoading(true);
        await api.delete(`/kelas/${selectedKelasData.id}`);
        setSnackbar({ open: true, message: 'Data kelas berhasil dihapus', severity: 'success' });
        fetchKelas(); 
        handleCloseDialogs();
      } catch (error) {
        console.error('Error deleting kelas:', error);
        const errMsg = error.response?.data?.message || 'Gagal menghapus data';
        setSnackbar({ open: true, message: errMsg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

  // --- KOLOM DATAGRID ---
  const columns = [
    { 
        field: 'nama_kelas', // Sesuai JSON
        headerName: 'Nama Kelas', 
        flex: 1, 
        minWidth: 120,
        renderCell: (params) => <Typography fontWeight="bold">{params.value}</Typography>
    },
    { 
        field: 'wali_kelas', // Sesuai JSON (Object)
        headerName: 'Wali Kelas', 
        flex: 1, 
        minWidth: 200,
        valueGetter: (value, row) => {
            const rowData = row || value?.row;
            // Ambil nama_lengkap dari objek wali_kelas
            return rowData?.wali_kelas?.nama_lengkap || '-';
        }
    },
    { field: 'tingkat', headerName: 'Tingkat', width: 100, align: 'center', headerAlign: 'center' },
    { 
        field: 'siswa', // Sesuai JSON (Array)
        headerName: 'Jml Siswa', 
        width: 130, 
        align: 'center', 
        headerAlign: 'center',
        valueGetter: (value, row) => {
            const rowData = row || value?.row;
            // Hitung panjang array siswa
            return rowData?.siswa?.length || 0;
        },
        renderCell: (params) => (
            <Chip label={params.value} size="small" color="primary" variant="outlined" />
        )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Lihat Detail">
            <IconButton color="info" size="small" onClick={() => handleView(params.row)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus">
            <IconButton color="error" size="small" onClick={() => handleDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 }, bgcolor: 'grey.50'}}>
      <Card sx={{ p: { xs: 1.5, sm: 1.5, md: 2 }, mb:{ xs: 1, sm: 1.5, md: 3 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center" justifyContent="space-between">
        {/* Search */}
        <Grid size={{ xs: 12, sm: 6, md: 8 }} >
          <TextField
            fullWidth
            size="small"
            placeholder="Cari kelas..."
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

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
             <FormControl fullWidth size="small">
                <InputLabel>Filter Tingkat</InputLabel>
                <Select 
                  value={selectedTingkat} 
                  label="Filter Tingkat" 
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                >
                  <MenuItem value="Semua">Semua Tingkat</MenuItem>
                  <MenuItem value="1">Kelas 1</MenuItem>
                  <MenuItem value="2">Kelas 2</MenuItem>
                  <MenuItem value="3">Kelas 3</MenuItem>
                  <MenuItem value="4">Kelas 4</MenuItem>
                  <MenuItem value="5">Kelas 5</MenuItem>
                  <MenuItem value="6">Kelas 6</MenuItem>
                </Select>
              </FormControl>
        </Grid>

        {/* Add Button */}
        <Grid size={{ xs: 6, sm: 2, md: 2 }}>
          <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={handleAdd}>
            Tambah
          </Button>
        </Grid>
      </Grid>
      </Card>

      <Card sx={{ p: { xs: 1, sm: 1.5, md: 2 }}}>
        <Box sx={{width: '100%'}}>
        <DataGrid
          rows={filteredKelas}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.100',
            },
          }}
        />
        </Box>
      </Card>

      {/* --- FORM DIALOG --- */}
      <Dialog open={openFormDialog} onClose={handleCloseDialogs} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              {/* Nama Kelas */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField 
                    name="nama_kelas" 
                    label="Nama Kelas (Cth: 1A)" 
                    defaultValue={selectedKelasData?.nama_kelas || ''} 
                    fullWidth required 
                />
              </Grid>
              
              {/* Tingkat */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField 
                    name="tingkat" 
                    label="Tingkat (1-6)" 
                    type="number"
                    defaultValue={selectedKelasData?.tingkat || ''} 
                    fullWidth required 
                />
              </Grid>

              {/* Wali Kelas (Dropdown dari API Pegawai) */}
              <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                <FormControl fullWidth required>
                    <InputLabel>Wali Kelas</InputLabel>
                    <Select 
                        name="wali_kelas_id" 
                        label="Wali Kelas" 
                        defaultValue={selectedKelasData?.wali_kelas_id || ''}
                    >
                        {pegawaiOptions.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.nama_lengkap}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
              </Grid>
              
              {/* Status */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedKelasData?.status || 'Aktif'}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialogs}>Batal</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- DETAIL DIALOG --- */}
      <Dialog 
          open={openDetailDialog} 
          onClose={handleCloseDialogs} 
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
              <SchoolIcon />
              Detail Kelas
          </DialogTitle>
          <DialogContent>
              {selectedKelasData && (
                  <Box sx={{ pt: 3 }}>
                      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                          <Typography variant="h4" fontWeight="600" align="center">{selectedKelasData.nama_kelas}</Typography>
                          <Typography variant="subtitle1" align="center" color="text.secondary">
                              Tingkat {selectedKelasData.tingkat}
                          </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                          <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Wali Kelas</Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                  <PersonIcon color="action" />
                                  <Typography fontWeight="500" variant="h6">
                                      {selectedKelasData.wali_kelas?.nama_lengkap || 'Belum ditentukan'}
                                  </Typography>
                              </Box>
                              {selectedKelasData.wali_kelas?.nip && (
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                    NIP: {selectedKelasData.wali_kelas.nip}
                                </Typography>
                              )}
                          </Grid>
                          
                          <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Jumlah Siswa</Typography>
                              <Typography fontWeight="500" variant="h6">
                                  {selectedKelasData.siswa?.length || 0} Siswa
                              </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip 
                                  label={selectedKelasData.status || 'Aktif'} 
                                  size="small" 
                                  color={selectedKelasData.status === 'Nonaktif' ? 'error' : 'success'} 
                              />
                          </Grid>
                      </Grid>
                  </Box>
              )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialogs} variant="outlined">Tutup</Button>
              <Button 
                  variant="contained" 
                  onClick={() => { 
                      handleCloseDialogs(); 
                      handleEdit(selectedKelasData); 
                  }}
              >
                  Edit
              </Button>
          </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialogs} TransitionComponent={Fade}>
        <DialogTitle sx={{ color: 'error.main' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Tindakan ini tidak dapat dibatalkan!</Alert>
          <Typography>Apakah Anda yakin ingin menghapus kelas <strong>{selectedKelasData?.nama_kelas}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Batal</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DataKelasCRUD;
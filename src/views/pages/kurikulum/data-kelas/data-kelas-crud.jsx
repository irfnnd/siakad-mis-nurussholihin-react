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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';

// Data Dummy
const initialRows = [
  {
    id: 1,
    kodeKelas: '10A',
    waliKelas: 'Budi Santoso',
    tingkat: 'X',
    jumlahSiswa: 30,
  },
  {
    id: 2,
    kodeKelas: '11B',
    waliKelas: 'Ani Yudhoyono',
    tingkat: 'XI',
    jumlahSiswa: 28,
  },
  {
    id: 3,
    kodeKelas: '12C',
    waliKelas: 'Rina Dewi',
    tingkat: 'XII',
    jumlahSiswa: 25,
  },
];

const DataKelasCRUD = () => {
  const [kelas, setKelas] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedKelasData, setSelectedKelasData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Ambil data dummy (simulasi fetch API)
  useEffect(() => {
    setTimeout(() => {
      setKelas(initialRows);
      setFilteredKelas(initialRows);
      setLoading(false);
      setSnackbar({ open: true, message: 'Data kelas berhasil dimuat', severity: 'success' });
    }, 1200);
  }, []);

  // Filter
  useEffect(() => {
    let filtered = kelas;
    if (searchTerm) {
      filtered = filtered.filter(k =>
        k.kodeKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.waliKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.jurusan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== 'Semua') {
      filtered = filtered.filter(k => k.status === selectedStatus);
    }
    setFilteredKelas(filtered);
  }, [searchTerm, selectedStatus, kelas]);

  // Handlers
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newData = {
      id: isEditMode ? selectedKelasData.id : Date.now(),
      kodeKelas: formData.get('kodeKelas'),
      waliKelas: formData.get('waliKelas'),
      tingkat: formData.get('tingkat'),
      jumlahSiswa: formData.get('jumlahSiswa'),
    };

    if (isEditMode) {
      setKelas(kelas.map(k => (k.id === selectedKelasData.id ? newData : k)));
      setSnackbar({ open: true, message: 'Data kelas berhasil diperbarui', severity: 'success' });
    } else {
      setKelas([...kelas, newData]);
      setSnackbar({ open: true, message: 'Kelas baru berhasil ditambahkan', severity: 'success' });
    }

    handleCloseDialogs();
  };

  const handleConfirmDelete = () => {
    setKelas(kelas.filter(k => k.id !== selectedKelasData.id));
    setSnackbar({ open: true, message: 'Data kelas berhasil dihapus', severity: 'success' });
    handleCloseDialogs();
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedStatus('Semua');
  };

  const columns = [
    { field: 'kodeKelas', headerName: 'Kode Kelas', flex: 1, minWidth: 120 },
    { field: 'waliKelas', headerName: 'Wali Kelas', flex: 1, minWidth: 200 },
    { field: 'tingkat', headerName: 'Tingkat', width: 100 },
    { field: 'jumlahSiswa', headerName: 'Jumlah Siswa', width: 130 },
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
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={11} flex={1} md={4}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Tambah Kelas
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 2 }}>
        <DataGrid
          rows={filteredKelas}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.100',
            },
          }}
        />
      </Card>

      {/* Dialog Form */}
      <Dialog open={openFormDialog} onClose={handleCloseDialogs} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="kodeKelas" label="Kode Kelas" defaultValue={selectedKelasData?.kodeKelas || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="waliKelas" label="Wali Kelas" defaultValue={selectedKelasData?.waliKelas || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="tingkat" label="Tingkat (X/XI/XII)" defaultValue={selectedKelasData?.tingkat || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="jurusan" label="Jurusan" defaultValue={selectedKelasData?.jurusan || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="jumlahSiswa" label="Jumlah Siswa" type="number" defaultValue={selectedKelasData?.jumlahSiswa || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
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
      {/* Dialog Detail Kelas */}
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
                      {/* Bagian Header tanpa Avatar */}
                      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                          <Typography variant="h5" fontWeight="600">{selectedKelasData.kodeKelas}</Typography>
                          <Typography variant="subtitle1" color="text.secondary">
                              Tahun Ajaran: {selectedKelasData.tahunAjaran || 'N/A'}
                          </Typography>
                      </Box>
                      
                      {/* Bagian Informasi Detail */}
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Wali Kelas</Typography>
                              <Typography fontWeight="500">{selectedKelasData.waliKelas}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Jumlah Siswa</Typography>
                              <Typography fontWeight="500">{selectedKelasData.jumlahSiswa} Siswa</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Tingkat</Typography>
                              <Typography fontWeight="500">{selectedKelasData.tingkat}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Jurusan</Typography>
                              <Typography fontWeight="500">{selectedKelasData.jurusan}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip 
                                  label={selectedKelasData.status} 
                                  size="small" 
                                  color={selectedKelasData.status === 'Aktif' ? 'success' : 'error'} 
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
      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialogs} TransitionComponent={Fade}>
        <DialogTitle sx={{ color: 'error.main' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Tindakan ini tidak dapat dibatalkan!</Alert>
          <Typography>Apakah Anda yakin ingin menghapus kelas <strong>{selectedKelasData?.kodeKelas}</strong>?</Typography>
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

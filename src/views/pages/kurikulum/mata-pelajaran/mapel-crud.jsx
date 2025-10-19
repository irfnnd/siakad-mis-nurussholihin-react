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
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Data dummy untuk Mata Pelajaran tingkat SD
const initialRows = [
  { id: 1, kode_mapel: 'PAI-I', nama_mapel: 'Pendidikan Agama Islam', kelompok: 'Mata Pelajaran Umum', kkm: 75, status: 'Aktif' },
  { id: 2, kode_mapel: 'MTK-IV', nama_mapel: 'Matematika', kelompok: 'Mata Pelajaran Umum', kkm: 70, status: 'Aktif' },
  { id: 3, kode_mapel: 'TEMATIK-I', nama_mapel: 'Tematik Kelas 1', kelompok: 'Tematik Terpadu', kkm: 75, status: 'Aktif' },
  { id: 4, kode_mapel: 'PJOK-V', nama_mapel: 'Pendidikan Jasmani', kelompok: 'Mata Pelajaran Umum', kkm: 72, status: 'Aktif' },
  { id: 5, kode_mapel: 'MULOK-B-DAERAH', nama_mapel: 'Bahasa Daerah', kelompok: 'Muatan Lokal', kkm: 70, status: 'Nonaktif' },
];

const MapelCRUD_SD = () => {
  // State management
  const [mapel, setMapel] = useState([]);
  const [filteredMapel, setFilteredMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelompok, setSelectedKelompok] = useState('Semua');

  // Simulasi pengambilan data
  useEffect(() => {
    setTimeout(() => {
      setMapel(initialRows);
      setFilteredMapel(initialRows);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter data berdasarkan pencarian dan filter kelompok
  useEffect(() => {
    let filtered = mapel;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.kode_mapel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedKelompok !== 'Semua') {
      filtered = filtered.filter((m) => m.kelompok === selectedKelompok);
    }
    setFilteredMapel(filtered);
  }, [searchTerm, selectedKelompok, mapel]);

  // Handler functions
  const handleClickAdd = () => {
    setIsEditMode(false);
    setSelectedMapel(null);
    setOpenFormDialog(true);
  };

  const handleClickEdit = (m) => {
    setIsEditMode(true);
    setSelectedMapel(m);
    setOpenFormDialog(true);
  };

  const handleClickDelete = (m) => {
    setSelectedMapel(m);
    setOpenConfirmDialog(true);
  };

  const handleCloseForm = () => setOpenFormDialog(false);
  const handleCloseConfirm = () => setOpenConfirmDialog(false);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newMapelData = {
      id: isEditMode ? selectedMapel.id : Date.now(),
      kode_mapel: formData.get('kode_mapel'),
      nama_mapel: formData.get('nama_mapel'),
      kelompok: formData.get('kelompok'),
      kkm: Number(formData.get('kkm')),
      status: formData.get('status'),
    };

    if (isEditMode) {
      setMapel(mapel.map((m) => (m.id === selectedMapel.id ? newMapelData : m)));
      setSnackbar({ open: true, message: 'Data mata pelajaran berhasil diperbarui', severity: 'success' });
    } else {
      setMapel([...mapel, newMapelData]);
      setSnackbar({ open: true, message: 'Mata pelajaran baru berhasil ditambahkan', severity: 'success' });
    }
    handleCloseForm();
  };

  const handleConfirmDelete = () => {
    setMapel(mapel.filter((m) => m.id !== selectedMapel.id));
    setSnackbar({ open: true, message: 'Data mata pelajaran berhasil dihapus', severity: 'success' });
    handleCloseConfirm();
  };

  // Kolom DataGrid
  const columns = [
    { field: 'kode_mapel', headerName: 'Kode Mapel', width: 150 },
    { field: 'nama_mapel', headerName: 'Nama Mata Pelajaran', flex: 1, minWidth: 250 },
    { field: 'kelompok', headerName: 'Kelompok', width: 200 },
    { field: 'kkm', headerName: 'KKM', type: 'number', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Aktif' ? 'success' : 'error'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
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
        <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
        >
            {/* Bagian kiri: Pencarian & Filter */}
            <Grid item sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
            <TextField
                size="small"
                placeholder="Cari berdasarkan nama atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <SearchIcon />
                    </InputAdornment>
                ),
                }}
                sx={{ width: '40%' }}
            />

            <FormControl size="small" sx={{ width: '25%' }}>
                <InputLabel>Filter Kelompok</InputLabel>
                <Select
                value={selectedKelompok}
                label="Filter Kelompok"
                onChange={(e) => setSelectedKelompok(e.target.value)}
                >
                <MenuItem value="Semua">Semua Kelompok</MenuItem>
                <MenuItem value="Tematik Terpadu">Tematik Terpadu</MenuItem>
                <MenuItem value="Mata Pelajaran Umum">Mata Pelajaran Umum</MenuItem>
                <MenuItem value="Muatan Lokal">Muatan Lokal</MenuItem>
                </Select>
            </FormControl>
            </Grid>

            {/* Bagian kanan: Tombol Tambah */}
            <Grid item>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickAdd}
            >
                Tambah
            </Button>
            </Grid>
        </Grid>
        </Card>


      <Card sx={{ p: 2 }}>
        <Box sx={{width: '100%' }}>
          <DataGrid
            rows={filteredMapel}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ border: 0 }}
          />
        </Box>
      </Card>

      {/* Dialog Form Tambah/Edit */}
      <Dialog open={openFormDialog} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="kode_mapel" label="Kode Mapel" defaultValue={selectedMapel?.kode_mapel || ''} fullWidth required disabled={isEditMode} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="nama_mapel" label="Nama Mata Pelajaran" defaultValue={selectedMapel?.nama_mapel || ''} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Kelompok Mata Pelajaran</InputLabel>
                  <Select name="kelompok" label="Kelompok Mata Pelajaran" defaultValue={selectedMapel?.kelompok || ''}>
                    <MenuItem value="Tematik Terpadu">Tematik Terpadu</MenuItem>
                    <MenuItem value="Mata Pelajaran Umum">Mata Pelajaran Umum</MenuItem>
                    <MenuItem value="Muatan Lokal">Muatan Lokal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="kkm" label="KKM (Nilai Minimum)" type="number" defaultValue={selectedMapel?.kkm || ''} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedMapel?.status || 'Aktif'}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button type="submit" variant="contained">{isEditMode ? 'Perbarui' : 'Simpan'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Tindakan ini tidak dapat dibatalkan.</Alert>
          <Typography sx={{ mt: 2 }}>
            Apakah Anda yakin ingin menghapus mata pelajaran **{selectedMapel?.nama_mapel}**?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Ya, Hapus</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapelCRUD_SD;
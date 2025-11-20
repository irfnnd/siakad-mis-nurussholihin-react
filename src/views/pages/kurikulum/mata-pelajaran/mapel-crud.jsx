import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Typography, Grid, IconButton, Tooltip, Select, MenuItem, FormControl,
  InputLabel, Card, Chip, Alert, Snackbar, InputAdornment, Fade, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Import API Instance (Axios)
import api from '../../../../services/api'; // Pastikan path ini benar

const MapelCRUD_SD = () => {

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

  // =============================
  // 1. GET DATA DARI API (PERBAIKAN)
  // =============================
  const fetchMapel = async () => {
    setLoading(true);
    try {
      // Gunakan instance api, bukan fetch
      const response = await api.get('/mata-pelajaran');
      
      // Sesuaikan dengan struktur JSON backend Anda
      // Contoh: response.data.data.mata_pelajaran atau response.data.data
      const data = response.data?.data?.mata_pelajaran || response.data?.data || [];
      
      setMapel(data);
      setFilteredMapel(data);
    } catch (err) {
      console.error("Error fetching mapel:", err);
      setSnackbar({ open: true, message: "Gagal memuat data!", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMapel(); }, []);

  // =============================
  // FILTER (SEARCH + KOLOM KELOMPOK)
  // =============================
  useEffect(() => {
    let filtered = mapel;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          (m.nama_mapel && m.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (m.kode_mapel && m.kode_mapel.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedKelompok !== 'Semua') {
      filtered = filtered.filter((m) => m.kelompok === selectedKelompok);
    }
    setFilteredMapel(filtered);
  }, [searchTerm, selectedKelompok, mapel]);

  // =============================
  // TAMBAH & UPDATE DATA (PERBAIKAN)
  // =============================
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const body = {
      kode_mapel: formData.get("kode_mapel"),
      nama_mapel: formData.get("nama_mapel"),
      kelompok: formData.get("kelompok"),
      kkm: formData.get("kkm"),
      status: formData.get("status")
    };

    try {
      setLoading(true);
      if (isEditMode) {
        // UPDATE: api.put
        await api.put(`/mata-pelajaran/${selectedMapel.id}`, body);
        setSnackbar({ open: true, message: "Data berhasil diperbarui", severity: "success" });
      } else {
        // CREATE: api.post
        await api.post('/mata-pelajaran', body);
        setSnackbar({ open: true, message: "Data berhasil ditambahkan", severity: "success" });
      }

      fetchMapel(); // Refresh data
      setOpenFormDialog(false);

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Gagal menyimpan data!";
      setSnackbar({ open: true, message: errMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // DELETE DATA (PERBAIKAN)
  // =============================
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      // DELETE: api.delete
      await api.delete(`/mata-pelajaran/${selectedMapel.id}`);
      
      setSnackbar({ open: true, message: "Data berhasil dihapus", severity: "success" });
      fetchMapel();
      setOpenConfirmDialog(false);

    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Gagal menghapus!", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // HANDLERS & UI (SAMA SEPERTI SEBELUMNYA)
  // =============================
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

  const columns = [
    { field: 'kode_mapel', headerName: 'Kode Mapel', width: 150 },
    { field: 'nama_mapel', headerName: 'Nama Mata Pelajaran', flex: 1, minWidth: 250 },
    { field: 'kelompok', headerName: 'Kelompok', width: 200 },
    { field: 'kkm', headerName: 'KKM', type: 'number', width: 100 },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Aktif' ? 'success' : 'error'} />
      ),
    },
    {
      field: 'actions', headerName: 'Aksi', width: 120, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton color="primary" size="small" onClick={() => handleClickEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hapus">
            <IconButton color="error" size="small" onClick={() => handleClickDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 1.5, md: 2 }, bgcolor: 'grey.50' }}>

      {/* FILTER, SEARCH, ADD */}
      <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: { xs: 1.5, sm: 1.5, md: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">

          <Grid size={{ xs: 12, sm: 6, md: 7 }}>
            <TextField
              fullWidth size="small" placeholder="Cari..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 7, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Kelompok</InputLabel>
              <Select
                value={selectedKelompok}
                label="Filter Kelompok"
                onChange={(e) => setSelectedKelompok(e.target.value)}
              >
                <MenuItem value="Semua">Semua</MenuItem>
                <MenuItem value="Tematik">Tematik Terpadu</MenuItem>
                <MenuItem value="Umum">Mata Pelajaran Umum</MenuItem>
                <MenuItem value="Muatan Lokal">Muatan Lokal</MenuItem>
                <MenuItem value="Lainnya">Lainnya</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 5, sm: 6, md: 2 }}>
            <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
              Tambah
            </Button>
          </Grid>

        </Grid>
      </Card>

      {/* TABLE */}
      <Card sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
        <DataGrid
          rows={filteredMapel}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          autoHeight
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.100' } }}
        />
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {isEditMode ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
        </DialogTitle>

        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="kode_mapel" label="Kode Mapel" fullWidth required
                  defaultValue={selectedMapel?.kode_mapel || ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="nama_mapel" label="Nama Mata Pelajaran" fullWidth required
                  defaultValue={selectedMapel?.nama_mapel}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Kelompok</InputLabel>
                  <Select
                    name="kelompok" label="Kelompok"
                    defaultValue={selectedMapel?.kelompok || ""}
                  >
                    <MenuItem value="Tematik">Tematik Terpadu</MenuItem>
                    <MenuItem value="Umum">Mata Pelajaran Umum</MenuItem>
                    <MenuItem value="Muatan Lokal">Muatan Lokal</MenuItem>
                    <MenuItem value="Lainnya">Lainnya</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="kkm" label="KKM" type="number" required fullWidth
                  defaultValue={selectedMapel?.kkm}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" label="Status" defaultValue={selectedMapel?.status || "Aktif"}>
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenFormDialog(false)}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (isEditMode ? "Perbarui" : "Simpan")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIALOG DELETE */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} TransitionComponent={Fade}>
        <DialogTitle sx={{ color: 'error.main' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Tindakan ini tidak bisa dibatalkan.</Alert>
          <Typography sx={{ mt: 2 }}>
            Hapus mata pelajaran <b>{selectedMapel?.nama_mapel}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Ya, Hapus"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATION */}
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

export default MapelCRUD_SD;
import React, { useState, useEffect } from 'react';
import {
  Box, Card, Grid, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, IconButton, Tooltip, Tabs, Tab, Snackbar, Alert, Fade
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

// Import API Instance
import api from '../../../../services/api';

const TahunSemesterCRUD = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data State
  const [tahunList, setTahunList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);

  // Form State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Default values
  const [formData, setFormData] = useState({
    id: null,
    tahun: '',
    nama: 'Ganjil',
    tahun_ajaran_id: '',
    status: 'Nonaktif'
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTahun, resSem] = await Promise.all([
        api.get('/tahun-ajaran'),
        api.get('/semester')
      ]);

      // Extract data dengan aman sesuai struktur JSON backend
      // (response.data.data.tahun_ajaran / response.data.data.semester)
      const dataTahun = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
      const dataSemester = resSem.data?.data?.semester || resSem.data?.data || [];

      setTahunList(Array.isArray(dataTahun) ? dataTahun : []);
      setSemesterList(Array.isArray(dataSemester) ? dataSemester : []);

    } catch (error) {
      console.error("Error fetching data:", error);
      setTahunList([]);
      setSemesterList([]);
      setSnackbar({ open: true, message: 'Gagal memuat data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenDialog = (type, row = null) => {
    setIsEdit(!!row);
    if (tabIndex === 0) {
      // Form Tahun Ajaran
      setFormData({
        id: row?.id || null,
        tahun: row?.tahun || '',
        status: row?.status || 'Nonaktif'
      });
    } else {
      // Form Semester
      setFormData({
        id: row?.id || null,
        nama: row?.nama || 'Ganjil',
        tahun_ajaran_id: row?.tahun_ajaran?.id || row?.tahun_ajaran_id || '', // Handle object or ID
        status: row?.status || 'Nonaktif'
      });
    }
    setOpenDialog(true);
  };

  // Handler Aktivasi / Deaktivasi
  const handleStatusToggle = async (id, currentStatus, endpoint) => {
    try {
      // Jika ingin MENGAKTIFKAN, gunakan endpoint khusus /activate jika tersedia
      // Logic backend 'activateSemester' akan menonaktifkan yang lain secara otomatis.
      if (currentStatus === 'Nonaktif') {
        // Coba panggil endpoint activate
        await api.put(`/${endpoint}/${id}/activate`);
        setSnackbar({ open: true, message: 'Berhasil diaktifkan', severity: 'success' });
      } else {
        // Jika ingin MENONAKTIFKAN (Manual)
        await api.put(`/${endpoint}/${id}`, { status: 'Nonaktif' });
        setSnackbar({ open: true, message: 'Berhasil dinonaktifkan', severity: 'success' });
      }

      fetchData(); // Refresh data
    } catch (error) {
      // Fallback: Jika endpoint activate tidak ada, coba update biasa
      try {
        const newStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
        await api.put(`/${endpoint}/${id}`, { status: newStatus });
        setSnackbar({ open: true, message: 'Status berhasil diubah', severity: 'success' });
        fetchData();
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: 'Gagal mengubah status', severity: 'error' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = tabIndex === 0 ? 'tahun-ajaran' : 'semester';

    // Validasi Semester (Sesuai Controller)
    if (endpoint === 'semester') {
      if (!formData.tahun_ajaran_id) {
        setSnackbar({ open: true, message: 'Tahun Ajaran wajib dipilih', severity: 'error' });
        return;
      }
      if (!['Ganjil', 'Genap'].includes(formData.nama)) {
        setSnackbar({ open: true, message: 'Semester harus Ganjil atau Genap', severity: 'error' });
        return;
      }
    }

    try {
      if (isEdit) {
        // PUT
        await api.put(`/${endpoint}/${formData.id}`, formData);
        setSnackbar({ open: true, message: 'Data berhasil diperbarui', severity: 'success' });
      } else {
        // POST
        await api.post(`/${endpoint}`, formData);
        setSnackbar({ open: true, message: 'Data berhasil ditambahkan', severity: 'success' });
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      const msg = error.response?.data?.message || 'Gagal menyimpan data';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // --- COLUMNS ---
  const columnsTahun = [
    { field: 'tahun', headerName: 'Tahun Ajaran', flex: 1, minWidth: 200 },
    {
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Aktif' ? 'success' : 'default'}
          size="small"
          variant={params.value === 'Aktif' ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={params.row.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
            <IconButton
              color={params.row.status === 'Aktif' ? 'success' : 'default'}
              onClick={() => handleStatusToggle(params.row.id, params.row.status, 'tahun-ajaran')}
            >
              {params.row.status === 'Aktif' ? <ToggleOnIcon fontSize='large' /> : <ToggleOffIcon fontSize='large' />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => handleOpenDialog('tahun', params.row)} color="primary"><EditIcon /></IconButton>
        </Box>
      )
    }
  ];

  const columnsSemester = [
    {
      field: 'tahun_ajaran', headerName: 'Tahun Ajaran', flex: 1,
      // --- PERBAIKAN DI SINI ---
      valueGetter: (value, row) => {
        // Logika aman untuk MUI v5 (row ada di value.row) dan v6 (row ada di arg ke-2)
        const rowData = row || value?.row;
        return rowData?.tahun_ajaran?.tahun || '-';
      }
    },
    { field: 'nama', headerName: 'Semester', flex: 1 },
    {
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Aktif' ? 'success' : 'default'}
          size="small"
          variant={params.value === 'Aktif' ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={params.row.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
            <IconButton
              color={params.row.status === 'Aktif' ? 'success' : 'default'}
              onClick={() => handleStatusToggle(params.row.id, params.row.status, 'semester')}
            >
              {params.row.status === 'Aktif' ? <ToggleOnIcon fontSize='large' /> : <ToggleOffIcon fontSize='large' />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => handleOpenDialog('semester', params.row)} color="primary"><EditIcon /></IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 2 }, bgcolor: 'grey.50', minHeight: '80vh' }}>

      <Card sx={{ p: { xs: 2, sm: 2, md: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable"
            scrollButtons="auto">
            <Tab label="Tahun Ajaran" />
            <Tab label="Semester" />
          </Tabs>
        </Box>

        {/* TAB TAHUN AJARAN */}
        {tabIndex === 0 && (
          <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  p: 1,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  Tambah
                </Button>
              </Box>

            <DataGrid
              autoHeight
              rows={tahunList}
              columns={columnsTahun}
              loading={loading}
              pageSizeOptions={[5]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } }
              }}
              disableRowSelectionOnClick
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            />
          </Box>
        )}


        {/* TAB SEMESTER */}
        {tabIndex === 1 && (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={semesterList}
              columns={columnsSemester}
              loading={loading}
              pageSizeOptions={[5]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } }
              }}
              disableRowSelectionOnClick
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            />
          </Box>
        )}
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{isEdit ? 'Edit' : 'Tambah'} {tabIndex === 0 ? 'Tahun Ajaran' : 'Semester'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {tabIndex === 0 ? (
                <Grid size={{ xs: 12, sm: 6, md: 8}}>
                  <TextField
                    label="Tahun Ajaran (Cth: 2024/2025)"
                    fullWidth required
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    helperText="Semester Ganjil & Genap akan otomatis dibuat."
                  />
                </Grid>
              ) : (
                <>
                  {/* Dropdown Tahun Ajaran Wajib Ada saat buat/edit semester */}
                  <Grid size={{ xs: 12, sm: 6, md: 4}}>
                    <FormControl fullWidth required>
                      <InputLabel>Tahun Ajaran</InputLabel>
                      <Select
                        value={formData.tahun_ajaran_id}
                        label="Tahun Ajaran"
                        onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
                      >
                        {/* Pengecekan Array sebelum Map */}
                        {Array.isArray(tahunList) && tahunList.map(t => (
                          <MenuItem key={t.id} value={t.id}>{t.tahun}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Semester</InputLabel>
                      <Select
                        value={formData.nama}
                        label="Semester"
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      >
                        <MenuItem value="Ganjil">Ganjil</MenuItem>
                        <MenuItem value="Genap">Genap</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button type="submit" variant="contained">Simpan</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TahunSemesterCRUD;
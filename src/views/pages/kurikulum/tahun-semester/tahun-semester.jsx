import React, { useState, useEffect } from 'react';
import {
  Box, Card, Grid, Button, Typography, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, 
  Chip, IconButton, Tooltip, Tabs, Tab, Snackbar, Alert, Fade, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import api from '../../../../services/api'; // Sesuaikan path api

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
  const [formData, setFormData] = useState({ id: null, tahun: '', nama: '', tahun_ajaran_id: '', status: 'Nonaktif' });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTahun, resSem] = await Promise.all([
        api.get('/tahun-ajaran'),
        api.get('/semester')
      ]);
      
      setTahunList(resTahun.data?.data || []);
      setSemesterList(resSem.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
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
    // Reset form based on Tab
    if (tabIndex === 0) { // Tahun
        setFormData({ 
            id: row?.id || null, 
            tahun: row?.tahun || '', 
            status: row?.status || 'Nonaktif' 
        });
    } else { // Semester
        setFormData({ 
            id: row?.id || null, 
            nama: row?.nama || 'Ganjil', 
            tahun_ajaran_id: row?.tahun_ajaran_id || '', 
            status: row?.status || 'Nonaktif' 
        });
    }
    setOpenDialog(true);
  };

  const handleStatusToggle = async (id, currentStatus, endpoint) => {
    try {
      // Logic: Jika mengaktifkan, sistem backend biasanya otomatis menonaktifkan yang lain
      const newStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
      await api.put(`/${endpoint}/${id}`, { status: newStatus });
      setSnackbar({ open: true, message: 'Status berhasil diubah', severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal mengubah status', severity: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = tabIndex === 0 ? 'tahun-ajaran' : 'semester';
    
    try {
      if (isEdit) {
        await api.put(`/${endpoint}/${formData.id}`, formData);
        setSnackbar({ open: true, message: 'Data berhasil diperbarui', severity: 'success' });
      } else {
        await api.post(`/${endpoint}`, formData);
        setSnackbar({ open: true, message: 'Data berhasil ditambahkan', severity: 'success' });
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Gagal menyimpan data', severity: 'error' });
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
        />
      )
    },
    {
      field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
            <Tooltip title={params.row.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
                <IconButton color={params.row.status === 'Aktif' ? 'success' : 'default'} onClick={() => handleStatusToggle(params.row.id, params.row.status, 'tahun-ajaran')}>
                    {params.row.status === 'Aktif' ? <ToggleOnIcon fontSize='large'/> : <ToggleOffIcon fontSize='large'/>}
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
        valueGetter: (params) => params.row.tahun_ajaran?.tahun || '-'
    },
    { field: 'nama', headerName: 'Semester', flex: 1 },
    { 
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Aktif' ? 'success' : 'default'} 
          size="small" 
        />
      )
    },
    {
      field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
            <Tooltip title={params.row.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
                <IconButton color={params.row.status === 'Aktif' ? 'success' : 'default'} onClick={() => handleStatusToggle(params.row.id, params.row.status, 'semester')}>
                    {params.row.status === 'Aktif' ? <ToggleOnIcon fontSize='large'/> : <ToggleOffIcon fontSize='large'/>}
                </IconButton>
            </Tooltip>
            <IconButton onClick={() => handleOpenDialog('semester', params.row)} color="primary"><EditIcon /></IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '80vh' }}>
      
      <Card sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Tahun Ajaran" />
                <Tab label="Semester" />
            </Tabs>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Tambah {tabIndex === 0 ? 'Tahun' : 'Semester'}
            </Button>
        </Box>

        {/* TAB TAHUN AJARAN */}
        {tabIndex === 0 && (
             <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={tahunList}
                    columns={columnsTahun}
                    loading={loading}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                />
             </Box>
        )}

        {/* TAB SEMESTER */}
        {tabIndex === 1 && (
             <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={semesterList}
                    columns={columnsSemester}
                    loading={loading}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Tahun Ajaran (Cth: 2024/2025)" 
                                fullWidth required
                                value={formData.tahun}
                                onChange={(e) => setFormData({...formData, tahun: e.target.value})}
                            />
                        </Grid>
                    ) : (
                        <>
                             <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Tahun Ajaran</InputLabel>
                                    <Select 
                                        value={formData.tahun_ajaran_id}
                                        label="Tahun Ajaran"
                                        onChange={(e) => setFormData({...formData, tahun_ajaran_id: e.target.value})}
                                    >
                                        {tahunList.map(t => (
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
                                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
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
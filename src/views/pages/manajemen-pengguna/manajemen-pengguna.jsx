import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, Grid, Card, FormControl, InputLabel, Select, MenuItem, Button, 
  Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography, 
  Snackbar, Alert, Fade, TextField, Chip, InputAdornment
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge'; // Untuk Role

// --- DATA MOCKUP ---
// (Di aplikasi nyata, ini di-fetch dari API)
const mockUsers = [
  { id: 'U-001', nama: 'Admin Utama', username: 'admin', email: 'admin@sekolah.id', role: 'Admin', status: 'Aktif' },
  { id: 'U-002', nama: 'Budi Hartono, S.Pd.', username: 'budi.guru', email: 'budi.h@sekolah.id', role: 'Guru', status: 'Aktif' },
  { id: 'U-003', nama: 'Siti Aminah, M.Pd.', username: 'siti.guru', email: 'siti.a@sekolah.id', role: 'Guru', status: 'Aktif' },
  { id: 'U-004', nama: 'Budi Santoso', username: 'budi.siswa', email: 'budi.s@siswa.id', role: 'Siswa', status: 'Aktif' },
  { id: 'U-005', nama: 'Ani Yudhoyono', username: 'ani.siswa', email: 'ani.y@siswa.id', role: 'Siswa', status: 'Aktif' },
  { id: 'U-006', nama: 'User Nonaktif', username: 'nonaktif', email: 'nonaktif@sekolah.id', role: 'Guru', status: 'Nonaktif' },
];
// --- END DATA MOCKUP ---


// --- KOMPONEN UTAMA ---
const HalamanManajemenPengguna = () => {

  // === STATE ===
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Filter
  const [filters, setFilters] = useState({
    searchTerm: '',
    role: 'Semua'
  });

  // State Dialog Form
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State Dialog Konfirmasi (Aktivasi/Deaktivasi)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  // State Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // === EFEK (Muat data saat komponen mount) ===
  useEffect(() => {
    setLoading(true);
    // Simulasi fetch data
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);
  }, []); // Hanya jalan sekali

  // === MEMO (Untuk filtering) ===
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchRole = filters.role === 'Semua' || user.role === filters.role;
      const matchSearch = user.nama.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, filters]);
  
  // === HANDLER DIALOG FORM ===
  const handleClickAdd = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setOpenFormDialog(true);
  };
  
  const handleClickEdit = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setOpenFormDialog(true);
  };

  const handleCloseForm = () => {
    setOpenFormDialog(false);
    setSelectedUser(null);
  };
  
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Validasi password (hanya jika mode 'Add' atau jika password 'Edit' diisi)
    if (!isEditMode || (isEditMode && data.password)) {
      if (data.password !== data.konfirmasiPassword) {
        setSnackbar({ open: true, message: 'Password dan Konfirmasi Password tidak cocok!', severity: 'error' });
        return;
      }
    }
    
    if (isEditMode) {
      // Logika API UPDATE
      console.log('Update Pengguna:', selectedUser.id, data);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
      setSnackbar({ open: true, message: 'Data pengguna berhasil diperbarui!', severity: 'success' });
    } else {
      // Logika API CREATE
      const newUser = { ...data, id: `U-${Date.now()}`, status: 'Aktif' }; // Status default 'Aktif'
      console.log('Tambah Pengguna:', newUser);
      setUsers(prev => [newUser, ...prev]);
      setSnackbar({ open: true, message: 'Pengguna baru berhasil ditambahkan!', severity: 'success' });
    }
    
    handleCloseForm();
  };

  // === HANDLER DIALOG KONFIRMASI (Aktivasi/Nonaktif) ===
  const handleClickToggleStatus = (user) => {
    setSelectedUser(user);
    setOpenConfirmDialog(true);
  };
  
  const handleCloseConfirm = () => {
    setOpenConfirmDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmToggleStatus = () => {
    const newStatus = selectedUser.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    // Logika API UPDATE Status
    console.log(`Mengubah status ${selectedUser.id} menjadi ${newStatus}`);
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
    setSnackbar({ open: true, message: `Status pengguna berhasil diubah ke ${newStatus}`, severity: 'info' });
    handleCloseConfirm();
  };
  
  // Handler Lain
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  // === KOLOM DATAGRID ===
  const columns = [
    { field: 'nama', headerName: 'Nama Lengkap', flex: 1, minWidth: 200 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Admin') color = 'error';
        if (params.value === 'Guru') color = 'info';
        if (params.value === 'Siswa') color = 'success';
        return <Chip label={params.value} color={color} size="small" sx={{ fontWeight: 600 }} />;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const color = params.value === 'Aktif' ? 'success' : 'error';
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Aksi',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ row }) => {
        const isAktif = row.status === 'Aktif';
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleClickEdit(row)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={isAktif ? <ToggleOffIcon /> : <ToggleOnIcon />}
            label={isAktif ? 'Nonaktifkan' : 'Aktifkan'}
            onClick={() => handleClickToggleStatus(row)}
            color={isAktif ? 'error' : 'success'}
          />,
        ];
      },
    },
  ];


  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>

      {/* === 1. KARTU FILTER & AKSI === */}
      <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: 2 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          
          {/* Grup Filter */}
          <Grid size={{ xs: 12, sm: 8, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                name="searchTerm"
                placeholder='Cari..'
                value={filters.searchTerm}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{xs:6, sm:8, md:3}}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Role</InputLabel>
                <Select
                  name="role"
                  value={filters.role}
                  label="Filter Role"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="Semua">Semua Role</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Guru">Guru</MenuItem>
                  <MenuItem value="Siswa">Siswa</MenuItem>
                </Select>
              </FormControl>
          </Grid>
          
          {/* Tombol Tambah Pengguna */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleClickAdd}
            >
              Tambah
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* === 2. KARTU TABEL DATA PENGGUNA === */}
      <Card>
        <Box sx={{ p: 2, width: '100%', overflow: 'auto' }}>
          <Box sx={{ minWidth: '800px' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'grey.100',
                  fontWeight: 'bold',
                }
              }}
            />
          </Box>
        </Box>
      </Card>
      
      {/* === 3. DIALOG FORM (TAMBAH/EDIT) PENGGUNA === */}
      <Dialog 
        open={openFormDialog} 
        onClose={handleCloseForm} 
        fullWidth 
        maxWidth="sm"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          {isEditMode ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{xs:12, sm:8, md:6}}>
                <TextField 
                  name="nama" 
                  label="Nama Lengkap" 
                  fullWidth 
                  required 
                  defaultValue={selectedUser?.nama || ''} 
                />
              </Grid>
              <Grid size={{xs:12, sm:8, md:6}}>
                <TextField 
                  name="username" 
                  label="Username" 
                  fullWidth 
                  required 
                  disabled={isEditMode} // Username tidak bisa diubah saat edit
                  defaultValue={selectedUser?.username || ''}
                />
              </Grid>
              <Grid size={{xs:12, sm:8, md:6}}>
                <TextField 
                  name="email" 
                  label="Email" 
                  type="email" 
                  fullWidth 
                  required 
                  defaultValue={selectedUser?.email || ''} 
                />
              </Grid>
              <Grid size={{xs:12, sm:8, md:6}}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select name="role" label="Role" defaultValue={selectedUser?.role || ''}>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Guru">Guru</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:12, sm:8, md:12}}>
                <Typography variant="caption" color="text.secondary">
                  {isEditMode ? 'Kosongkan password jika tidak ingin mengubahnya.' : 'Password wajib diisi untuk pengguna baru.'}
                </Typography>
              </Grid>
              <Grid size={{xs:12, sm:8, md:6}}>
                <TextField 
                  name="password" 
                  label="Password" 
                  type="password" 
                  fullWidth 
                  required={!isEditMode} // Wajib diisi hanya saat 'Add'
                />
              </Grid>
              <Grid size={{xs:12, sm:8, md:6}}>
                <TextField 
                  name="konfirmasiPassword" 
                  label="Konfirmasi Password" 
                  type="password" 
                  fullWidth 
                  required={!isEditMode} // Wajib diisi hanya saat 'Add'
                />
              </Grid>
              
              {/* Opsi status hanya muncul saat Edit */}
              {isEditMode && (
                <Grid size={{xs:12, sm:8, md:6}}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" label="Status" defaultValue={selectedUser?.status || 'Aktif'}>
                      <MenuItem value="Aktif">Aktif</MenuItem>
                      <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm} variant="outlined">Batal</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      
      {/* === 4. DIALOG KONFIRMASI (AKTIVASI/NONAKTIF) === */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={handleCloseConfirm}
        TransitionComponent={Fade}
        maxWidth="xs"
      >
        <DialogTitle>Konfirmasi Perubahan Status</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin 
            <strong>{selectedUser?.status === 'Aktif' ? ' MENONAKTIFKAN ' : ' MENGAKTIFKAN '}</strong>
            pengguna <strong>{selectedUser?.nama}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button 
            onClick={handleConfirmToggleStatus} 
            color={selectedUser?.status === 'Aktif' ? 'error' : 'success'} 
            variant="contained"
          >
            Ya, {selectedUser?.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* === SNACKBAR NOTIFIKASI === */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default HalamanManajemenPengguna;
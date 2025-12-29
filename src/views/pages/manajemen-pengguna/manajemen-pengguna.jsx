import React, { useState, useMemo, useEffect, useRef } from 'react';
// Sesuaikan path import ini dengan struktur folder Anda yang sebenarnya
import api from '../../../services/api'; 

import {
  Box,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  Fade,
  TextField,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
  FormHelperText
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const HalamanManajemenPengguna = () => {
  // UI state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters + debounce
  const [filters, setFilters] = useState({ searchTerm: '', role: 'Semua' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  // Dialogs + form
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirmation (toggle status)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form defaults
  const formDefaults = {
    username: '',
    email: '',
    role: 'Guru', // Default
    password: '',
    konfirmasiPassword: '',
    status: 'Aktif',
    // Field Data Pegawai (Khusus Guru)
    nama_lengkap: '',
    nip: '',
    jabatan: '',
    telepon: '',
    jenis_kelamin: '',
    alamat: ''
  };
  const [formValues, setFormValues] = useState(formDefaults);

  // --- FETCH DATA DARI API ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.role !== 'Semua') params.role = filters.role;

      // GET /users
      const response = await api.get('/users', { params });

      // Sesuai controller: res.json({ data: { users: [...] } })
      const rawData = response.data?.data?.users || response.data?.data || [];

      // Mapping data untuk DataGrid
      const mappedUsers = rawData.map((u) => ({
        id: u.id,
        // Logic Display Nama: Ambil dari pegawai jika ada, fallback ke username
        nama: u.pegawai?.nama_lengkap || u.username,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status || 'Aktif',
        // Simpan raw data pegawai untuk keperluan Edit
        pegawaiData: u.pegawai || null
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('fetchUsers error', err);
      setSnackbar({ open: true, message: 'Gagal memuat data pengguna', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Efek untuk memanggil API saat debounce search atau role berubah
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role]);

  // Efek Debounce untuk search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm.trim());
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [filters.searchTerm]);

  // --- HANDLERS ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickAdd = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormValues(formDefaults);
    setOpenFormDialog(true);
  };

  const handleClickEdit = (row) => {
    setIsEditMode(true);
    setSelectedUser(row);

    // Isi form dengan data yang ada
    setFormValues({
      username: row.username,
      email: row.email,
      role: row.role,
      password: '', // Password kosong saat edit
      konfirmasiPassword: '',
      status: row.status,
      // Isi data pegawai jika ada
      nama_lengkap: row.pegawaiData?.nama_lengkap || '',
      nip: row.pegawaiData?.nip || '',
      jabatan: row.pegawaiData?.jabatan || '',
      telepon: row.pegawaiData?.telepon || '',
      jenis_kelamin: row.pegawaiData?.jenis_kelamin || '',
      alamat: row.pegawaiData?.alamat || ''
    });
    setOpenFormDialog(true);
  };

  const handleCloseForm = () => {
    setOpenFormDialog(false);
    setSelectedUser(null);
    setFormValues(formDefaults);
  };

  // --- SUBMIT FORM ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Password
    if (!isEditMode) {
      if (!formValues.password) {
        setSnackbar({ open: true, message: 'Password wajib diisi', severity: 'error' });
        return;
      }
      if (formValues.password !== formValues.konfirmasiPassword) {
        setSnackbar({ open: true, message: 'Password tidak cocok', severity: 'error' });
        return;
      }
    } else {
      if (formValues.password && formValues.password !== formValues.konfirmasiPassword) {
        setSnackbar({ open: true, message: 'Password tidak cocok', severity: 'error' });
        return;
      }
    }

    // 2. Validasi Khusus Guru (Sesuai Controller)
    if (formValues.role === 'Guru') {
      if (!formValues.nama_lengkap) {
        setSnackbar({ open: true, message: 'Nama Lengkap wajib diisi untuk Guru', severity: 'error' });
        return;
      }
      if (!formValues.nip) {
        setSnackbar({ open: true, message: 'NIP wajib diisi untuk Guru', severity: 'error' });
        return;
      }
      if (!formValues.jabatan) {
        setSnackbar({ open: true, message: 'Jabatan wajib diisi untuk Guru', severity: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      // 3. Susun Payload sesuai Controller
      const payload = {
        username: formValues.username,
        email: formValues.email,
        role: formValues.role,
        status: formValues.status
      };

      if (formValues.password) {
        payload.password = formValues.password;
      }

      // Tambahkan objek data_pegawai jika role Guru
      if (formValues.role === 'Guru') {
        payload.profile_data = {
          nama_lengkap: formValues.nama_lengkap,
          nip: formValues.nip,
          jabatan: formValues.jabatan,
          telepon: formValues.telepon,
          jenis_kelamin: formValues.jenis_kelamin,
          alamat: formValues.alamat
        };
      }

      if (isEditMode && selectedUser) {
        // PUT /users/:id
        await api.put(`/users/${selectedUser.id}`, payload);
        setSnackbar({ open: true, message: 'Pengguna berhasil diperbarui', severity: 'success' });
      } else {
        // POST /users
        await api.post('/users', payload);
        setSnackbar({ open: true, message: 'Pengguna baru berhasil ditambahkan', severity: 'success' });
      }

      handleCloseForm();
      fetchUsers();
    } catch (err) {
      console.error('submit user error', err);
      // Tampilkan pesan error spesifik dari backend jika ada
      const msg = err.response?.data?.message || 'Gagal menyimpan data';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- TOGGLE STATUS ---
  const handleClickToggleStatus = (userRow) => {
    setSelectedUser(userRow);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'Aktif' ? 'Nonaktif' : 'Aktif';

    setLoading(true);
    try {
      // Menggunakan endpoint update biasa untuk ganti status
      await api.put(`/users/${selectedUser.id}`, { status: newStatus });
      setSnackbar({ open: true, message: `Status diubah menjadi ${newStatus}`, severity: 'info' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Gagal mengubah status', severity: 'error' });
    } finally {
      setLoading(false);
      handleCloseConfirm();
    }
  };

  const handleFormValueChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- KOLOM TABEL ---
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
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleClickEdit(row)}
            color="primary"
          />,
          <GridActionsCellItem
            key="toggle"
            icon={isAktif ? <ToggleOffIcon /> : <ToggleOnIcon />}
            label={isAktif ? 'Nonaktifkan' : 'Aktifkan'}
            onClick={() => handleClickToggleStatus(row)}
            color={isAktif ? 'error' : 'success'}
          />
        ];
      },
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>

      {/* FILTER & ACTION CARD */}
      <Card sx={{ mb: { xs: 1, sm: 1.5, md: 3 }, p: 2 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item size={{ xs: 12, md: 6 }}>
            {/* PERBAIKAN DI SINI: Gunakan filters.searchTerm */}
            <TextField
              fullWidth
              size="small"
              name="searchTerm"
              placeholder="Cari nama / username / email..."
              value={filters.searchTerm} 
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              }}
            />
          </Grid>

          <Grid item size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Role</InputLabel>
              <Select name="role" value={filters.role} label="Filter Role" onChange={handleFilterChange}>
                <MenuItem value="Semua">Semua Role</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Guru">Guru</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 6, md: 3 }}>
            <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleClickAdd}>
              Tambah
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* USERS TABLE */}
      <Card>
        <Box sx={{ p: 2, width: '100%', overflow: 'auto' }}>
          <Box sx={{ minWidth: 800 }}>
            <DataGrid
              rows={users}
              columns={columns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.100', fontWeight: 'bold' }
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* DIALOG FORM ADD / EDIT */}
      <Dialog open={openFormDialog} onClose={handleCloseForm} fullWidth maxWidth="md" TransitionComponent={Fade}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          {isEditMode ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
        </DialogTitle>

        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              
              {/* --- BAGIAN 1: INFORMASI AKUN (Wajib Semua Role) --- */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>INFORMASI AKUN</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="username"
                  label="Username"
                  fullWidth
                  required
                  disabled={isEditMode} 
                  value={formValues.username}
                  onChange={handleFormValueChange('username')}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formValues.email}
                  onChange={handleFormValueChange('email')}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    label="Role"
                    value={formValues.role}
                    onChange={handleFormValueChange('role')}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Guru">Guru</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {isEditMode && (
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Status Akun</InputLabel>
                    <Select name="status" label="Status Akun" value={formValues.status} onChange={handleFormValueChange('status')}>
                      <MenuItem value="Aktif">Aktif</MenuItem>
                      <MenuItem value="Nonaktif">Nonaktif</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* --- BAGIAN 2: DATA PEGAWAI (Hanya Jika Role = Guru) --- */}
              {formValues.role === 'Guru' && (
                <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                             <SchoolIcon color="primary" fontSize="small" />
                             <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>DATA PEGAWAI (GURU)</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            name="nama_lengkap"
                            label="Nama Lengkap"
                            fullWidth
                            required
                            value={formValues.nama_lengkap}
                            onChange={handleFormValueChange('nama_lengkap')}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            name="nip"
                            label="NIP (Nomor Induk Pegawai)"
                            fullWidth
                            required
                            value={formValues.nip}
                            onChange={handleFormValueChange('nip')}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            name="jabatan"
                            label="Jabatan"
                            fullWidth
                            required
                            value={formValues.jabatan}
                            onChange={handleFormValueChange('jabatan')}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Jenis Kelamin</InputLabel>
                            <Select
                                name="jenis_kelamin"
                                label="Jenis Kelamin"
                                value={formValues.jenis_kelamin}
                                onChange={handleFormValueChange('jenis_kelamin')}
                            >
                                <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                                <MenuItem value="Perempuan">Perempuan</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            name="telepon"
                            label="No. Telepon"
                            fullWidth
                            value={formValues.telepon}
                            onChange={handleFormValueChange('telepon')}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12 }}>
                        <TextField
                            name="alamat"
                            label="Alamat"
                            fullWidth
                            multiline
                            rows={2}
                            value={formValues.alamat}
                            onChange={handleFormValueChange('alamat')}
                        />
                    </Grid>
                </>
              )}

              {/* --- BAGIAN 3: KEAMANAN (Password) --- */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                 <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                   {isEditMode ? 'KEAMANAN (Kosongkan jika tidak ingin mengubah password)' : 'KEAMANAN (Password wajib diisi)'}
                 </Typography>
                 <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  required={!isEditMode}
                  value={formValues.password}
                  onChange={handleFormValueChange('password')}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="konfirmasiPassword"
                  label="Konfirmasi Password"
                  type="password"
                  fullWidth
                  required={!isEditMode}
                  value={formValues.konfirmasiPassword}
                  onChange={handleFormValueChange('konfirmasiPassword')}
                  error={formValues.password !== formValues.konfirmasiPassword && formValues.konfirmasiPassword !== ''}
                  helperText={formValues.password !== formValues.konfirmasiPassword && formValues.konfirmasiPassword !== '' ? "Password tidak cocok" : ""}
                />
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm} variant="outlined">Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Simpan Perubahan' : 'Simpan')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIALOG CONFIRM STATUS */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirm} TransitionComponent={Fade} maxWidth="xs">
        <DialogTitle>Konfirmasi Perubahan Status</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin <strong>{selectedUser?.status === 'Aktif' ? 'MENONAKTIFKAN' : 'MENGAKTIFKAN'}</strong> pengguna <strong>{selectedUser?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Batal</Button>
          <Button onClick={handleConfirmToggleStatus} color={selectedUser?.status === 'Aktif' ? 'error' : 'success'} variant="contained">
            Ya, {selectedUser?.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanManajemenPengguna;
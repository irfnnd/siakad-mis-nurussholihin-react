import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Stack, 
  Button, 
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';

// Import Recharts untuk Grafik
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// Import API
import api from '../../services/api'; 

// Import Ikon
import { 
  Group as GroupIcon, 
  Badge as BadgeIcon, 
  School as SchoolIcon, 
  SupervisorAccount as SupervisorAccountIcon,
  PersonAdd as PersonAddIcon,
  NoteAdd as NoteAddIcon,
  Settings as SettingsIcon,
  Checklist as ChecklistIcon,
  Assessment as AssessmentIcon,
  AutoStories as AutoStoriesIcon,
  PieChart as PieChartIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

// --- HELPER: GET HARI INI ---
const getHariIni = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date().getDay()];
};

const getTanggalIni = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('id-ID', options);
};

// =================================================================
// --- DASHBOARD UNTUK ADMIN ---
// =================================================================
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    siswa: 0,
    pegawai: 0,
    kelas: 0,
    users: 0
  });
  const [chartData, setChartData] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Panggil API secara paralel
        // Kita gunakan limit besar untuk endpoint yang butuh hitung manual jika pagination totalItems tidak ada
        const [resSiswa, resPegawai, resKelas, resUsers, resKelasAll] = await Promise.allSettled([
          api.get('/siswa?limit=1'), 
          api.get('/pegawai?limit=1'),
          api.get('/kelas?limit=1'),
          api.get('/users?limit=1'),
          api.get('/kelas?limit=100') // Fetch semua kelas untuk grafik
        ]);

        // Helper untuk mengambil total items dengan lebih cerdas
        const getTotal = (res, keyName) => {
          if (res.status === 'fulfilled') {
             const responseData = res.value.data;
             const innerData = responseData?.data;

             // 1. Cek jika ada pagination.totalItems (Prioritas Utama)
             if (innerData?.pagination?.totalItems !== undefined) {
                 return innerData.pagination.totalItems;
             }

             // 2. Cek jika innerData itu sendiri adalah array (Non-paginated list)
             if (Array.isArray(innerData)) {
                 return innerData.length;
             }

             // 3. Cek jika ada key spesifik (misal 'siswa', 'pegawai') yang berisi array
             if (keyName && Array.isArray(innerData?.[keyName])) {
                 return innerData[keyName].length;
             }

             // 4. Fallback: Cari sembarang key yang isinya array (jika struktur tidak baku)
             if (typeof innerData === 'object' && innerData !== null) {
                 const keys = Object.keys(innerData);
                 for (const k of keys) {
                     if (Array.isArray(innerData[k])) {
                         return innerData[k].length;
                     }
                 }
             }
          } else {
             console.warn("API Error:", res.reason);
          }
          return 0;
        };

        setStats({
          siswa: getTotal(resSiswa, 'siswa'),
          pegawai: getTotal(resPegawai, 'pegawai'),
          kelas: getTotal(resKelas, 'kelas'),
          users: getTotal(resUsers, 'users')
        });

        // Proses Data Grafik
        if (resKelasAll.status === 'fulfilled') {
          const responseData = resKelasAll.value.data;
          const classes = responseData?.data?.kelas || responseData?.data || [];
          
          if (Array.isArray(classes)) {
            const dataGrafik = classes.map(cls => {
              // Hitung siswa: Cek array 'siswa' atau field 'jumlah_siswa'
              let count = 0;
              if (Array.isArray(cls.siswa)) count = cls.siswa.length;
              else if (cls.jumlah_siswa) count = parseInt(cls.jumlah_siswa);
              
              return {
                name: cls.nama_kelas,
                siswa: count
              };
            });
            
            // Sort A-Z
            dataGrafik.sort((a, b) => a.name.localeCompare(b.name));
            setChartData(dataGrafik);
          }
        }

      } catch (error) {
        console.error("Gagal memuat statistik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, md: 0 } }}>
      <Typography variant="h3" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Dashboard Admin
      </Typography>
      
      {/* 1. KARTU STATISTIK */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} mb={{ xs: 2, sm: 2, md: 2 }}>
        {/* Total Siswa */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}><GroupIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={20} /> : stats.siswa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Siswa</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Pegawai */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}><BadgeIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={20} /> : stats.pegawai}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Pegawai</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Kelas */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}><SchoolIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                     {loading ? <CircularProgress size={20} /> : stats.kelas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Kelas</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Pengguna */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main' }}><SupervisorAccountIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={20} /> : stats.users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Pengguna</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 2. GRAFIK & AKSES CEPAT */}
      <Grid container spacing={3}>
        {/* Grafik Data Siswa */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardHeader sx={{ pb: 0 }} title="Statistik Siswa per Kelas" />
            <CardContent>
              <Box sx={{ height: 300, width: '100%', mt: 2 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="siswa" 
                        name="Jumlah Siswa" 
                        fill="#1976d2" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" bgcolor="grey.100" borderRadius={2}>
                    <BarChartIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    <Typography color="text.secondary" ml={2}>Belum ada data kelas/siswa</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Akses Cepat */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardHeader sx={{ pb: 0 }} title="Akses Cepat" />
            <CardContent>
              <Stack spacing={2}>
                <Button variant="contained" startIcon={<PersonAddIcon />} href="/auth/manajemen-pengguna">
                  Tambah Pengguna Baru
                </Button>
                
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Button fullWidth variant="outlined" startIcon={<NoteAddIcon />} href="/data/siswa">
                        Data Siswa
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Button fullWidth variant="outlined" startIcon={<SettingsIcon />} href="/kurikulum/data-kelas">
                        Data Kelas
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Button fullWidth variant="outlined" startIcon={<AssessmentIcon />} href="/akademik/nilai-siswa">
                        Input Nilai
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Button fullWidth variant="outlined" startIcon={<ChecklistIcon />} href="/akademik/absensi-siswa">
                        Cek Absensi
                        </Button>
                    </Grid>
                </Grid>
                
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// =================================================================
// --- DASHBOARD UNTUK GURU ---
// =================================================================
const GuruDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [waliKelasInfo, setWaliKelasInfo] = useState(null); // { id, nama_kelas, jumlah_siswa }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data user dari localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const fetchGuruData = async () => {
      // Pastikan data pegawai ada
      if (!currentUser) return;

      setLoading(true);
      try {
        let pegawaiId = currentUser.pegawai?.id;

        // Fallback: Cari ID Pegawai jika tidak ada di localStorage
        if (!pegawaiId) {
             const resPegawai = await api.get('/pegawai'); 
             const pegawaiList = resPegawai.data?.data?.pegawai || resPegawai.data?.data || [];
             // Cari pegawai yang user_id-nya sama dengan user login
             const myProfile = pegawaiList.find(p => String(p.user_id) === String(currentUser.id));
             if (myProfile) pegawaiId = myProfile.id;
        }

        if (!pegawaiId) {
            console.warn("User Guru tapi tidak terhubung ke Pegawai.");
            setLoading(false);
            return;
        }

        const hariIni = getHariIni(); 

        // 1. Ambil Jadwal Hari Ini
        const resJadwal = await api.get('/jadwal-pelajaran', {
            params: { guru_id: pegawaiId, hari: hariIni }
        });
        
        const jadwalData = resJadwal.data?.data?.jadwal_pelajaran || resJadwal.data?.data || [];
        setJadwalHariIni(Array.isArray(jadwalData) ? jadwalData : []);

        // 2. Cek Apakah Wali Kelas
        const resKelas = await api.get('/kelas');
        const allKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        
        const myKelas = Array.isArray(allKelas) ? allKelas.find(k => String(k.wali_kelas_id) === String(pegawaiId)) : null;
        
        if (myKelas) {
             // Coba hitung jumlah siswa
             let jumlahSiswa = myKelas.jumlah_siswa || 0;
             if (!jumlahSiswa && myKelas.siswa) jumlahSiswa = myKelas.siswa.length;
             
             // Jika masih 0, coba fetch jumlah siswa dari API siswa dengan filter kelas
             if (!jumlahSiswa) {
                 try {
                     const resSiswa = await api.get('/siswa', { params: { kelas_id: myKelas.id, limit: 1 } });
                     jumlahSiswa = resSiswa.data?.data?.pagination?.totalItems || 0;
                 } catch (e) {}
             }

            setWaliKelasInfo({
                id: myKelas.id,
                nama_kelas: myKelas.nama_kelas,
                jumlah_siswa: jumlahSiswa
            });
        }

      } catch (error) {
        console.error("Error fetching guru data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchGuruData();
    }
  }, [currentUser]);

  if (!currentUser) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 0 } }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard Guru
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={3}>
        Selamat datang, {currentUser.pegawai?.nama_lengkap || currentUser.username}
      </Typography>

      <Grid container spacing={2}>
        
        {/* 1. JADWAL MENGAJAR HARI INI */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardHeader
              sx={{ pb: 0 }}
              title="Jadwal Mengajar Hari Ini"
              subheader={getTanggalIni()}
            />
            <CardContent sx={{ pt: 2 }}>
              {loading ? (
                  <Box display="flex" justifyContent="center"><CircularProgress /></Box>
              ) : jadwalHariIni.length > 0 ? (
                <List>
                  {jadwalHariIni.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon>
                        <AccessTimeIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                            <Typography variant="subtitle1" fontWeight="bold">
                                {item.mapel?.nama_mapel || item.mata_pelajaran?.nama_mapel || item.mata_pelajaran_jadwal?.nama_mapel} — Kelas {item.kelas?.nama_kelas}
                            </Typography>
                        }
                        secondary={`${(item.jam_mulai || '').substring(0,5)} - ${(item.jam_selesai || '').substring(0,5)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Tidak ada jadwal mengajar untuk hari ini ({getHariIni()}).
                </Alert>
              )}
              
              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
                href="/kurikulum/jadwal-pelajaran"
              >
                Lihat Jadwal Lengkap
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. KARTU WALI KELAS (Jika Ada) */}
        {waliKelasInfo && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <SchoolIcon fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                        Wali Kelas {waliKelasInfo.nama_kelas}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Jumlah Siswa: {waliKelasInfo.jumlah_siswa}
                        </Typography>
                    </Box>
                </Stack>
                
                <Typography variant="body2" paragraph>
                  Pantau kehadiran dan perkembangan nilai siswa perwalian Anda secara berkala.
                </Typography>
                
                <Stack direction="row" spacing={2}>
                    <Button
                    variant="contained"
                    startIcon={<ChecklistIcon />}
                    href="/akademik/absensi-siswa"
                    >
                    Input Absensi
                    </Button>
                    <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    href="/akademik/rapor-siswa"
                    sx={{ bgcolor: 'white' }}
                    >
                    Cek Rapor
                    </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 3. TINDAKAN CEPAT GURU */}
        <Grid size={{ xs: 12, md: waliKelasInfo ? 12 : 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                 Menu Akademik
              </Typography>
              <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                      <Button variant="outlined" fullWidth sx={{ height: '100%', flexDirection: 'column', py: 2 }} href="/akademik/nilai-siswa">
                          <AssessmentIcon fontSize="large" color="info" sx={{ mb: 1 }} />
                          Input Nilai
                      </Button>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                      <Button variant="outlined" fullWidth sx={{ height: '100%', flexDirection: 'column', py: 2 }} href="/akademik/absensi-siswa">
                          <ChecklistIcon fontSize="large" color="success" sx={{ mb: 1 }} />
                          Absensi
                      </Button>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                      <Button variant="outlined" fullWidth sx={{ height: '100%', flexDirection: 'column', py: 2 }} href="/akademik/rapor-siswa">
                          <AutoStoriesIcon fontSize="large" color="warning" sx={{ mb: 1 }} />
                          E-Rapor
                      </Button>
                  </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- KOMPONEN UTAMA DASHBOARD ---
const Dashboard = () => {
  // Ambil role dari localStorage (atau hook useAuth jika sudah fix)
  const [role, setRole] = useState(null);
  
  useEffect(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          const user = JSON.parse(userStr);
          setRole(user.role ? user.role.toLowerCase() : '');
      }
  }, []);

  if (!role) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;

  if (role === 'admin') {
    return <AdminDashboard />;
  }
  if (role === 'guru') {
    return <GuruDashboard />;
  }

  return (
      <Box p={3}>
          <Alert severity="warning">Role pengguna tidak dikenali ({role}).</Alert>
      </Box>
  );
};

export default Dashboard;
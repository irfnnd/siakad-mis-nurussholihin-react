import React from 'react';
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
  Paper,
  Divider
} from '@mui/material';

import useAuth from 'utils/useAuth'; 

// Import Ikon (Pastikan @mui/icons-material sudah terinstal)
import { 
  Group as GroupIcon, 
  Badge as BadgeIcon, 
  School as SchoolIcon, 
  SupervisorAccount as SupervisorAccountIcon,
  PersonAdd as PersonAddIcon,
  NoteAdd as NoteAddIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Checklist as ChecklistIcon,
  Assessment as AssessmentIcon,
  AutoStories as AutoStoriesIcon,
  PieChart as PieChartIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// --- KOMPONEN UTAMA DASHBOARD ---
const Dashboard = () => {
  const { role } = useAuth(); // 1. Dapatkan role pengguna
  // 4. Tampilkan dashboard yang sesuai berdasarkan role
  if (role === 'admin') {
    return <AdminDashboard />;
  }
  if (role === 'guru') {
    return <GuruDashboard />;
  }
};


// =================================================================
// --- DASHBOARD UNTUK ADMIN ---
// =================================================================
const AdminDashboard = () => {
  return (
    <Box sx={{ p: {xs:1, sm:2, md:3} }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>
      
      {/* 1. KARTU STATISTIK */}
      <Grid container spacing={{xs:2, sm:2, md:3}} mb={{xs:2, sm:2, md:3}}>
        {/* Total Siswa */}
        <Grid size={{xs:12, sm:6, md:3}}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}><GroupIcon /></Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>450</Typography>
                  <Typography variant="body2" color="text.secondary">Total Siswa Aktif</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Pegawai */}
        <Grid size={{xs:12, sm:6, md:3}}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}><BadgeIcon /></Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>35</Typography>
                  <Typography variant="body2" color="text.secondary">Total Pegawai</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Kelas */}
        <Grid size={{xs:6, sm:6, md:3}}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}><SchoolIcon /></Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>12</Typography>
                  <Typography variant="body2" color="text.secondary">Total Kelas</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Pengguna */}
        <Grid size={{xs:6, sm:6, md:3}}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main' }}><SupervisorAccountIcon /></Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>485</Typography>
                  <Typography variant="body2" color="text.secondary">Total Pengguna</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 2. GRAFIK & AKSES CEPAT */}
      <Grid container spacing={3}>
        {/* Grafik Siswa per Kelas */}
        <Grid size={{xs:12, sm:6, md:6}}>
          <Card elevation={2}>
            <CardHeader sx={{pb:0}} title="Jumlah Siswa per Kelas" />
            <CardContent>
              {/* CATATAN: Di sinilah Anda akan meletakkan komponen chart (misal: Recharts, Chart.js).
                Ini adalah placeholder.
              */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                <BarChartIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                <Typography color="text.secondary" ml={2}>[Placeholder Grafik Batang]</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Akses Cepat */}
        <Grid size={{xs:12, sm:6, md:6}}>
          <Card elevation={2}>
            <CardHeader sx={{pb:0}} title="Akses Cepat" />
            <CardContent>
              <Stack spacing={2}>
                <Button variant="contained" startIcon={<PersonAddIcon />} href="/manajemen-user/data-user">
                  Tambah Pengguna Baru
                </Button>
                <Button variant="outlined" startIcon={<NoteAddIcon />} href="/data-master/data-siswa">
                  Tambah Siswa Baru
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} href="/kurikulum/data-kelas">
                  Kelola Kelas & Mapel
                </Button>
                <Button variant="outlined" startIcon={<ChecklistIcon />} href="/akademik/absensi-siswa">
                  Kelola Absensi Hari Ini
                </Button>
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
  // Data dummy (ganti dengan data asli)
  const isWaliKelas = true;
  const kelasWali = '10A';
  const jadwalHariIni = [
    { jam: '07:00 - 08:30', mapel: 'Matematika', kelas: '10A' },
    { jam: '09:00 - 10:30', mapel: 'Fisika', kelas: '11B' }
  ];
  const penilaianMendatang = [
    { tanggal: '7 Nov', nama: 'Ulangan Harian Fisika (11B)' },
    { tanggal: '10 Nov', nama: 'Tugas Matematika (10A)' }
  ];

return (
  <Box sx={{ p: { xs: 1, sm: 2, md: 2 } }}>
    <Typography variant="h4" fontWeight={600} gutterBottom>
      Dashboard
    </Typography>
    <Typography variant="h6" color="text.secondary" mb={3}>
      Selamat datang, Budi Hartono, S.Pd.
    </Typography>

    <Grid container spacing={2}>
      {/* 1. JADWAL HARI INI */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card elevation={2}>
          <CardHeader
            sx={{ pb: 0 }}
            title="Jadwal Mengajar Hari Ini"
            subheader="Rabu, 5 November 2025"
          />
          <CardContent sx={{ pt: 1 }}>
            <List>
              {jadwalHariIni.length > 0 ? (
                jadwalHariIni.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      <AccessTimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.mapel} - Kelas ${item.kelas}`}
                      secondary={item.jam}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography color="text.secondary">
                  Anda tidak memiliki jadwal mengajar hari ini.
                </Typography>
              )}
            </List>
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

      
      {/* 4. RINGKASAN ABSENSI & PENILAIAN */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card elevation={2}>
          <CardHeader sx={{pb:0}} title={`Status Absensi ${kelasWali} Hari Ini`} />
          <CardContent>
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 2,
              }}
            >
              <PieChartIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              <Typography color="text.secondary" ml={2}>
                [Placeholder Grafik Donut]
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. KARTU WALI KELAS */}
      {isWaliKelas && (
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ bgcolor: 'primary.lighter' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Wali Kelas: {kelasWali}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Jangan lupa untuk mencatat absensi dan memantau perkembangan siswa Anda.
              </Typography>
              <Button
                variant="contained"
                startIcon={<ChecklistIcon />}
                href="/akademik/absensi-siswa"
              >
                Input Absensi {kelasWali} Hari Ini
              </Button>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* 3. TINDAKAN CEPAT */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Buku Nilai
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Input atau edit nilai harian, PTS, dan PAS.
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  href="/akademik/nilai-siswa"
                >
                  Input/Edit Nilai Siswa
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AutoStoriesIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Rapor Siswa
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Lihat dan finalisasi rapor untuk kelas wali Anda.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  href="/akademik/rapor-siswa"
                  disabled={!isWaliKelas}
                >
                  Lihat Rapor {kelasWali}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

};

export default Dashboard;
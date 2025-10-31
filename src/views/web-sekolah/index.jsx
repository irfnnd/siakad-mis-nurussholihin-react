import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Paper,
  Chip,
  IconButton,
  Fab,
  useTheme,
  useScrollTrigger,
  Zoom,
  Fade
} from '@mui/material';
import {
  School,
  Article,
  Event,
  Info,
  KeyboardArrowUp,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';

// Import icon social media secara terpisah
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';

const WebSekolah = () => {
  const theme = useTheme();
  
  // Data berita sekolah
  const beritaSekolah = [
    {
      id: 1,
      judul: 'Kegiatan Peringatan Hari Guru Nasional 2025',
      gambar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
      deskripsi: 'SMA Negeri 1 XYZ memperingati Hari Guru Nasional dengan upacara dan berbagai lomba antar guru dan siswa.',
      tanggal: '25 November 2024',
      kategori: 'Acara'
    },
    {
      id: 2,
      judul: 'Siswa SMA 1 XYZ Raih Juara Olimpiade Sains',
      gambar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
      deskripsi: 'Prestasi membanggakan diraih oleh siswa kelas 12 MIPA, yang berhasil menjadi juara 1 Olimpiade Sains tingkat provinsi.',
      tanggal: '18 November 2024',
      kategori: 'Prestasi'
    },
    {
      id: 3,
      judul: 'Kegiatan Bakti Sosial di Desa Binaan',
      gambar: 'https://images.unsplash.com/photo-1559027615-ce3e8e0726d7',
      deskripsi: 'Sebagai bentuk kepedulian sosial, siswa SMA Negeri 1 XYZ melaksanakan bakti sosial di Desa Sungai Pinang.',
      tanggal: '10 November 2024',
      kategori: 'Sosial'
    }
  ];

  const dokumenSekolah = [
    { id: 1, nama: 'Profil Sekolah 2025', link: '#', icon: '📄' },
    { id: 2, nama: 'Visi dan Misi Sekolah', link: '#', icon: '🎯' },
    { id: 3, nama: 'Struktur Organisasi', link: '#', icon: '🏛️' },
    { id: 4, nama: 'Laporan Kegiatan 2024', link: '#', icon: '📊' }
  ];

  const fasilitasSekolah = [
    { nama: 'Laboratorium Komputer', icon: '💻' },
    { nama: 'Perpustakaan Digital', icon: '📚' },
    { nama: 'Lapangan Olahraga', icon: '⚽' },
    { nama: 'Laboratorium IPA', icon: '🔬' }
  ];

  // Fungsi scroll to section
  const handleScroll = (sectionId) => {
    if (sectionId === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const appBar = document.querySelector('header');
      const appBarHeight = appBar ? appBar.clientHeight : 0;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - appBarHeight - 16;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top component
  const ScrollTop = ({ children }) => {
    const trigger = useScrollTrigger({
      threshold: 100,
    });

    const handleClick = (event) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <Zoom in={trigger}>
        <Box
          onClick={handleClick}
          role="presentation"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          {children}
        </Box>
      </Zoom>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* === NAVBAR IMPROVED === */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 2, fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                SMA NEGERI 1 XYZ
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Sekolah Unggul Berprestasi
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            {['beranda', 'profil', 'berita', 'dokumentasi', 'fasilitas'].map((item) => (
              <Button
                key={item}
                color="inherit"
                onClick={() => handleScroll(item)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {item}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* === HERO SECTION IMPROVED === */}
      <Box
        id="beranda"
        sx={{
          background: `linear-gradient(rgba(26, 35, 126, 0.8), rgba(26, 35, 126, 0.9)), url('https://images.unsplash.com/photo-1588075592446-231ad5da3a4e')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: 'white',
          textAlign: 'center',
          py: { xs: 10, md: 15 },
          px: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={1000}>
            <Box>
              <Chip 
                label="Sekolah Unggulan" 
                color="secondary" 
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography variant="h2" fontWeight={800} sx={{ mb: 3 }}>
                Selamat Datang di <br />SMA Negeri 1 XYZ
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                Membentuk Generasi Unggul, Berkarakter, dan Berprestasi di Tingkat Nasional
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary"
                  onClick={() => handleScroll('profil')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  Jelajahi Sekolah
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  color="inherit"
                  onClick={() => handleScroll('berita')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  Lihat Berita
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* === PROFIL SEKOLAH IMPROVED === */}
      <Container id="profil" maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip 
            icon={<Info />} 
            label="Tentang Kami" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Profil Sekolah
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Menjadi institusi pendidikan unggulan yang mencetak generasi berkarakter dan berprestasi
          </Typography>
        </Box>
        
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in timeout={800}>
              <Paper 
                elevation={8} 
                sx={{ 
                  overflow: 'hidden', 
                  borderRadius: 4,
                  transform: 'rotate(-2deg)',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.02)',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1581090700227-1e37b190418e"
                  alt="Sekolah"
                  style={{ 
                    width: '100%', 
                    height: 400, 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Paper>
            </Fade>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
                Sejarah & Visi Kami
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                <strong>SMA Negeri 1 XYZ</strong> merupakan salah satu sekolah unggulan di Kota Padang yang 
                berdiri sejak tahun 1985. Dengan pengalaman lebih dari 35 tahun, kami berkomitmen 
                untuk membentuk peserta didik yang beriman, berilmu, dan berakhlak mulia.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                Didukung oleh tenaga pendidik profesional, fasilitas lengkap, serta berbagai program 
                ekstrakurikuler yang inovatif, SMA Negeri 1 XYZ menjadi tempat terbaik untuk 
                mengembangkan potensi akademik dan non-akademik siswa.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      35+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tahun Pengalaman
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      50+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Guru Berpengalaman
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ my: 2 }} />

      {/* === FASILITAS === */}
      <Container id="fasilitas" maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip 
            icon={<School />} 
            label="Fasilitas" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Fasilitas Sekolah
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {fasilitasSekolah.map((fasilitas, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in timeout={600 + index * 100}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-8px)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`
                    }
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {fasilitas.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {fasilitas.nama}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ my: 2 }} />

      {/* === BERITA / KEGIATAN IMPROVED === */}
      <Container id="berita" maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip 
            icon={<Article />} 
            label="Update Terbaru" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Berita & Kegiatan
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {beritaSekolah.map((berita, index) => (
            <Grid item xs={12} md={4} key={berita.id}>
              <Fade in timeout={800 + index * 200}>
                <Card
                  sx={{
                    borderRadius: 4,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia 
                      component="img" 
                      height="220" 
                      image={berita.gambar} 
                      alt={berita.judul}
                      sx={{ transition: 'transform 0.3s ease' }}
                    />
                    <Chip
                      label={berita.kategori}
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {berita.tanggal}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, lineHeight: 1.4 }}>
                      {berita.judul}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {berita.deskripsi}
                    </Typography>
                    <Button 
                      variant="text" 
                      color="primary" 
                      sx={{ mt: 2, fontWeight: 600 }}
                    >
                      Baca Selengkapnya →
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ my: 2 }} />

      {/* === DOKUMENTASI SEKOLAH IMPROVED === */}
      <Container id="dokumentasi" maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip 
            icon={<Event />} 
            label="Dokumen" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Dokumentasi Sekolah
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {dokumenSekolah.map((doc, index) => (
            <Grid item xs={12} sm={6} md={3} key={doc.id}>
              <Fade in timeout={600 + index * 100}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '& .doc-icon': {
                        transform: 'scale(1.2)'
                      }
                    }
                  }}
                  onClick={() => window.open(doc.link, '_blank')}
                >
                  <Typography 
                    variant="h4" 
                    className="doc-icon"
                    sx={{ 
                      mb: 2,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {doc.icon}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {doc.nama}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* === FOOTER IMPROVED === */}
      <Box sx={{ 
        bgcolor: '#1a237e', 
        color: 'white', 
        py: 8,
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700}>
                  SMA NEGERI 1 XYZ
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Jl. Pendidikan No. 123, Kota Padang<br />
                Sumatera Barat, Indonesia
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton color="inherit" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton color="inherit" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton color="inherit" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton color="inherit" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <YouTubeIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Kontak Kami
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="body2">(0751) 123456</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="body2">info@sman1xyz.sch.id</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="body2">Lihat di Google Maps</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Tautan Cepat
              </Typography>
              <Stack spacing={1}>
                {['beranda', 'profil', 'berita', 'dokumentasi', 'fasilitas'].map((item) => (
                  <Button
                    key={item}
                    color="inherit"
                    onClick={() => handleScroll(item)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textTransform: 'capitalize',
                      opacity: 0.8,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
            © {new Date().getFullYear()} SMA Negeri 1 XYZ — Semua Hak Dilindungi
          </Typography>
        </Container>
      </Box>

      {/* Scroll to top button */}
      <ScrollTop>
        <Fab color="primary" size="medium" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </Box>
  );
};

export default WebSekolah;
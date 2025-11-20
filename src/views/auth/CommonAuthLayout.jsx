import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/cards/MainCard';

// assets
import Logo from '../../../public/whitelogo.png';

// ==============================|| COMMON AUTH LAYOUT ||============================== //

export default function CommonAuthLayout({ title, subHeading, footerLink, children }) {
  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ bgcolor: 'common.black', height: 1, minHeight: '100vh' }}>
      <Grid size={{ xs: 11, sm: 7, md: 6, lg: 4 }}>
        <MainCard
          sx={{
            overflow: 'visible',
            display: 'flex',
            position: 'relative',
            '& .MuiCardContent-root': { flexGrow: 1, flexBasis: '50%', width: '50%' },
            maxWidth: 475,
            margin: '24px auto'
          }}
          contentSX={{ flexGrow: 1, flexBasis: '50%', width: '50%', px: 4, pt: 5 }}
        >
          <Stack direction="column" sx={{ mb: 2, gap: 4, justifyContent: 'center' }}>
            
            {/* --- BAGIAN HEADER (LOGO & JUDUL) --- */}
            <Stack
              direction="column" 
              sx={{ 
                justifyContent: 'center', 
                alignItems: 'center', // Membuat logo & teks rata tengah secara horizontal
                gap: 2 
              }}
            >
              {/* 1. Logo dipindah ke Atas */}
              <Link to="/">
                <CardMedia 
                  component="img" 
                  image={Logo} 
                  alt="logo" 
                  sx={{ width: 'auto', maxHeight: 60 }} // Opsional: Atur ukuran logo agar proporsional
                />
              </Link>

              {/* 2. Judul (Sign In) dipindah ke Bawah Logo */}
              <Box sx={{ textAlign: 'center' }}> {/* Text align center agar teks judul rapi */}
                <Typography color="text.primary" gutterBottom variant="h3">
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subHeading}
                </Typography>
              </Box>
            </Stack>

            {children}
          </Stack>
          
          {footerLink && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" component={Link} to={footerLink.link} sx={{ textDecoration: 'none' }}>
                {footerLink.title}
                </Typography>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

CommonAuthLayout.propTypes = {
  title: PropTypes.string,
  subHeading: PropTypes.string,
  footerLink: PropTypes.object,
  children: PropTypes.node
};
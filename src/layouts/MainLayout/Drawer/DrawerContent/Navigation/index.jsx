import { useMemo } from 'react'; // <-- 1. TAMBAHKAN IMPOR INI

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import menuItems from 'menu-items';
import NavGroup from './NavGroup';
import useAuth from '../../../../../utils/useAuth'; // <-- 2. TAMBAHKAN IMPOR INI (sesuaikan path jika perlu)

// ==============================|| DRAWER CONTENT - RESPONSIVE DRAWER ||============================== //

export default function NavigationDrawer() {
  
  // 3. TAMBAHKAN LOGIKA FILTER DI SINI
  const { role } = useAuth(); // Dapatkan role (cth: "admin" atau "guru")

  const filteredMenuItems = useMemo(() => {
    if (!menuItems?.items) {
      return []; // Keamanan jika menuItems tidak terdefinisi
    }
    
    // Filter item menu utama
    return menuItems.items.filter((item) => {
      // Jika grup menu (seperti 'dashboard') tidak punya 'roles', tampilkan
      if (!item.roles) {
        return true;
      }
      // Jika punya, cek apakah role pengguna ada di dalam array 'roles'
      return item.roles.includes(role);
    });
  }, [role]); // Filter ini akan dijalankan ulang jika 'role' berubah
  // --- BATAS TAMBAHAN ---


  // 4. UBAH .map() AGAR MENGGUNAKAN 'filteredMenuItems'
  const navGroups = filteredMenuItems.map((item, index) => { // <-- UBAH INI
    switch (item.type) {
      case 'group':
        return <NavGroup key={index} item={item} />;
      default:
        return (
          <Typography key={index} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ transition: 'all 0.3s ease-in-out' }}>{navGroups}</Box>;
}
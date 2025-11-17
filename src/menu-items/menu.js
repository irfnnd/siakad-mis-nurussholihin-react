// --- IMPORT IKON ---
import Dashboard from '@mui/icons-material/Dashboard';
import Groups from '@mui/icons-material/Groups';
import PersonAdd from '@mui/icons-material/PersonAdd';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
// (Tambahkan ikon lain yang Anda perlukan)

// --- OBJEK IKON ---
// (Anda sepertinya sudah memiliki ini di file Anda, pastikan saja ikon baru ada)
const icons = {
  IconDashboard: Dashboard,
  IconUsersGroup: Groups,
  IconUserAdd: PersonAdd,
  IconCalendar: CalendarMonth,
  IconPrint: PrintIcon,
  IconChecklist: ChecklistIcon,
  IconNoteAlt: NoteAltIcon
  // (Pastikan semua ikon yang Anda gunakan di menu ada di sini)
};

// ==============================|| MENU ITEMS ||============================== //
// Setiap grup menu sekarang memiliki properti 'roles'

// Dashboard
const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  roles: ['admin', 'guru'], // <-- BISA DILIHAT OLEH ADMIN & GURU
  children: [
    {
      id: 'overview',
      title: 'Beranda',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

// Manajemen Data
const manajemenData = {
  id: 'manajemen-data',
  title: 'Manajemen Data',
  type: 'group',
  roles: ['admin'], // <-- HANYA BISA DILIHAT OLEH ADMIN
  children: [
    {
      id: 'data-master',
      title: 'Data Master',
      type: 'collapse',
      icon: icons.IconUsersGroup,
      children: [
        {
          id: 'data-siswa',
          title: 'Data Siswa',
          type: 'item',
          url: '/data/siswa'
        },
        {
          id: 'data-pegawai',
          title: 'Data Pegawai',
          type: 'item',
          url: '/data/pegawai'
        }
      ]
    }
  ]
};

// Akademik
const akademik = {
  id: 'manajemen-akademik',
  title: 'Manajemen Akademik',
  type: 'group',
  roles: ['guru'], // <-- BISA DILIHAT OLEH ADMIN & GURU
  children: [
    {
      id: 'input-nilai',
      title: 'Nilai Siswa',
      type: 'item',
      url: '/akademik/nilai-siswa',
      icon: icons.IconNoteAlt 
    },
    {
      id: 'e-rapor',
      title: 'Rapor Siswa',
      type: 'item',
      url: '/akademik/rapor-siswa',
      icon: icons.IconPrint
    },
    {
      id: 'absensi',
      title: 'Absensi Siswa',
      type: 'item',
      url: '/akademik/absensi-siswa',
      icon: icons.IconChecklist
    }
  ]
};

// Kurikulum
const kurikulum = {
  id: 'kurikulum',
  title: 'Kurikulum',
  type: 'group',
  roles: ['admin'], // <-- HANYA BISA DILIHAT OLEH ADMIN
  children: [
    {
      id: 'manajemen-kurikulum',
      title: 'Manajemen Kurikulum',
      type: 'collapse',
      icon: icons.IconCalendar,
      children: [
        {
          id: 'data-kelas',
          title: 'Data Kelas',
          type: 'item',
          url: '/kurikulum/data-kelas'
        },
        {
          id: 'mata-pelajaran',
          title: 'Mata Pelajaran',
          type: 'item',
          url: '/kurikulum/mata-pelajaran'
        },
        {
          id: 'jadwal-pelajaran',
          title: 'Jadwal Pelajaran',
          type: 'item',
          url: '/kurikulum/jadwal-pelajaran'
        }
      ]
    }
  ]
};

// Manajemen User
const manajemenUser = {
  id: 'manajemen-user',
  title: 'Manajemen User',
  type: 'group',
  roles: ['admin'], // <-- HANYA BISA DILIHAT OLEH ADMIN
  children: [
    {
      id: 'data-user',
      title: 'Data User',
      type: 'item',
      url: '/auth/manajemen-pengguna',
      icon: icons.IconUserAdd
    }
  ]
};

// ==============================|| EKSPOR MENU UTAMA ||============================== //
// File Anda mengekspor objek 'items' di dalam 'menuItems'
const menuItems = {
  items: [dashboard, akademik, kurikulum, manajemenData, manajemenUser]
};

// Ini akan diekspor oleh file 'index.js' Anda
export default menuItems;
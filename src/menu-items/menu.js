// --- IMPORT IKON ---
import Dashboard from '@mui/icons-material/Dashboard';
import Groups from '@mui/icons-material/Groups';
import PersonAdd from '@mui/icons-material/PersonAdd';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import School from '@mui/icons-material/School';
import Person from '@mui/icons-material/Person';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import AutoStories from '@mui/icons-material/AutoStories';
import Schedule from '@mui/icons-material/Schedule';
import EventRepeatIcon from '@mui/icons-material/EventRepeat'; 

// --- OBJEK IKON ---
const icons = {
  IconDashboard: Dashboard,
  IconUsersGroup: Groups,
  IconUserAdd: PersonAdd,
  IconCalendar: CalendarMonth, // Digunakan untuk Tahun Semester
  IconPrint: PrintIcon,
  IconChecklist: ChecklistIcon,
  IconNoteAlt: NoteAltIcon,
  IconSchool: School,
  IconUser: Person,
  IconRoom: MeetingRoom,     // Digunakan untuk Data Kelas
  IconNotebook: AutoStories, // Digunakan untuk Mata Pelajaran
  IconSchedule: Schedule,    // Digunakan untuk Jadwal
  IconTahun: EventRepeatIcon
};

// ==============================|| MENU ITEMS ||============================== //

// 1. Dashboard
const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  roles: ['admin', 'guru'],
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

// 2. Manajemen Data (Hanya Admin)
const manajemenData = {
  id: 'manajemen-data',
  title: 'Manajemen Data',
  type: 'group',
  roles: ['admin'], 
  children: [
    {
      id: 'data-siswa',
      title: 'Data Siswa',
      type: 'item',
      url: '/data/siswa',
      icon: icons.IconSchool
    },
    {
      id: 'data-pegawai',
      title: 'Data Pegawai',
      type: 'item',
      url: '/data/pegawai',
      icon: icons.IconUser
    }
  ]
};

// 3. Akademik (Admin & Guru)
const akademik = {
  id: 'manajemen-akademik',
  title: 'Manajemen Akademik',
  type: 'group',
  roles: ['admin', 'guru'],
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

// 4. Kurikulum (Campuran Hak Akses)
const kurikulum = {
  id: 'kurikulum',
  title: 'Kurikulum',
  type: 'group',
  roles: ['admin'], // Grup utama bisa dilihat keduanya, tapi item di dalamnya difilter lagi
  children: [
    {
      id: 'data-kelas',
      title: 'Data Kelas',
      type: 'item',
      url: '/kurikulum/data-kelas',
      icon: icons.IconRoom,
    },
    {
      id: 'mata-pelajaran',
      title: 'Mata Pelajaran',
      type: 'item',
      url: '/kurikulum/mata-pelajaran',
      icon: icons.IconNotebook,
    },
    {
      id: 'tahun-semester',
      title: 'Tahun Semester',
      type: 'item',
      url: '/kurikulum/tahun-semester',
      icon: icons.IconCalendar, // Menggunakan icon kalender
    },
    {
      id: 'jadwal-pelajaran',
      title: 'Jadwal Pelajaran',
      type: 'item',
      url: '/kurikulum/jadwal-pelajaran',
      icon: icons.IconSchedule,
    }
  ]
};
const jadwal = {
  id: 'jadwal-pelajaran',
  title: 'Jadwal',
  type: 'group',
  roles: [ 'guru'], // Grup utama bisa dilihat keduanya, tapi item di dalamnya difilter lagi
  children: [
    {
      id: 'mata-pelajaran',
      title: 'Mata Pelajaran',
      type: 'item',
      url: '/jadwal/mata-pelajaran',
      icon: icons.IconNotebook,
    },
    {
      id: 'jadwal-pelajaran',
      title: 'Jadwal Pelajaran',
      type: 'item',
      url: '/jadwal/jadwal-pelajaran',
      icon: icons.IconSchedule,
    }
  ]
};


// 5. Manajemen User (Hanya Admin)
const manajemenUser = {
  id: 'manajemen-user',
  title: 'Manajemen User',
  type: 'group',
  roles: ['admin'],
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
const menuItems = {
  items: [dashboard, akademik, kurikulum, manajemenData, manajemenUser, jadwal]
};

export default menuItems;
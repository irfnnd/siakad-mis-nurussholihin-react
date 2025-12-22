// --- IMPORT IKON ---
import Dashboard from '@mui/icons-material/Dashboard';
import Groups from '@mui/icons-material/Groups';
import PersonAdd from '@mui/icons-material/PersonAdd';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
// --- Ikon Baru Ditambahkan ---
import School from '@mui/icons-material/School';
import Person from '@mui/icons-material/Person';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import AutoStories from '@mui/icons-material/AutoStories';
import Schedule from '@mui/icons-material/Schedule';

// --- OBJEK IKON ---
const icons = {
  IconDashboard: Dashboard,
  IconUsersGroup: Groups,
  IconUserAdd: PersonAdd,
  IconCalendar: CalendarMonth,
  IconPrint: PrintIcon,
  IconChecklist: ChecklistIcon,
  IconNoteAlt: NoteAltIcon,
  // --- Ikon Baru Ditambahkan ---
  IconSchool: School,
  IconUser: Person,
  IconRoom: MeetingRoom,
  IconNotebook: AutoStories,
  IconSchedule: Schedule
};

// ==============================|| MENU ITEMS ||============================== //

// Dashboard
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

// Manajemen Data
const manajemenData = {
  id: 'manajemen-data',
  title: 'Manajemen Data',
  type: 'group',
  roles: ['admin'], // <-- HANYA BISA DILIHAT OLEH ADMIN
  children: [
    // --- PERUBAHAN: 'type: collapse' dihapus ---
    // Item sekarang langsung di bawah 'group'
    {
      id: 'data-siswa',
      title: 'Data Siswa',
      type: 'item',
      url: '/data/siswa',
      icon: icons.IconSchool // <-- Ikon ditambahkan
    },
    {
      id: 'data-pegawai',
      title: 'Data Pegawai',
      type: 'item',
      url: '/data/pegawai',
      icon: icons.IconUser // <-- Ikon ditambahkan
    }
  ]
};

// Akademik
const akademik = {
  id: 'manajemen-akademik',
  title: 'Manajemen Akademik',
  type: 'group',
  // --- PERUBAHAN: 'roles' disesuaikan dengan komentar Anda ---
  roles: ['guru', 'admin'], // <-- BISA DILIHAT OLEH ADMIN & GURU
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
    // --- PERUBAHAN: 'type: collapse' dihapus ---
    // Item sekarang langsung di bawah 'group'
    {
      id: 'data-kelas',
      title: 'Data Kelas',
      type: 'item',
      url: '/kurikulum/data-kelas',
      icon: icons.IconRoom // <-- Ikon ditambahkan
    },
    {
      id: 'mata-pelajaran',
      title: 'Mata Pelajaran',
      type: 'item',
      url: '/kurikulum/mata-pelajaran',
      icon: icons.IconNotebook // <-- Ikon ditambahkan
    },
    {
      id: 'tahun-semester',
      title: 'Tahun Semester',
      type: 'item',
      url: '/kurikulum/tahun-semester',
      icon: icons.IconCalendar // <-- Ikon ditambahkan
    },
    {
      id: 'jadwal-pelajaran',
      title: 'Jadwal Pelajaran',
      type: 'item',
      url: '/kurikulum/jadwal-pelajaran',
      icon: icons.IconSchedule // <-- Ikon ditambahkan
    }
  ]
};

// Manajemen User
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
  items: [dashboard, akademik, kurikulum, manajemenData, manajemenUser]
};

export default menuItems;
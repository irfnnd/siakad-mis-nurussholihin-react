// ==============================|| IMPORT IKON MATERIAL-UI ||============================== //
import Dashboard from '@mui/icons-material/Dashboard';
import Groups from '@mui/icons-material/Groups';
import Person from '@mui/icons-material/Person';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Security from '@mui/icons-material/Security';
import Work from '@mui/icons-material/Work';
import MenuBook from '@mui/icons-material/MenuBook';
import Assessment from '@mui/icons-material/Assessment';
import PlaylistAddCheck from '@mui/icons-material/PlaylistAddCheck';
import Campaign from '@mui/icons-material/Campaign';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import AutoStories from '@mui/icons-material/AutoStories';
import Schedule from '@mui/icons-material/Schedule';
import Language from '@mui/icons-material/Language';
import School from '@mui/icons-material/School';
import Article from '@mui/icons-material/Article';
import PhotoLibrary from '@mui/icons-material/PhotoLibrary';

// ==============================|| PENYIMPANAN IKON DALAM OBJEK ||============================== //
const icons = {
  IconDashboard: Dashboard,
  IconUsersGroup: Groups,
  IconUser: Person,
  IconUserAdd: PersonAdd,
  IconSecurity: Security,
  IconBriefcase: Work,
  IconBook: MenuBook,
  IconReport: Assessment,
  IconChecklist: PlaylistAddCheck,
  IconSpeakerphone: Campaign,
  IconCalendar: CalendarMonth,
  IconRoom: MeetingRoom,
  IconNotebook: AutoStories,
  IconSchedule: Schedule,
  IconLanguage: Language,
  IconSchool: School,
  IconArticle: Article,
  IconPhoto: PhotoLibrary
};

// ==============================|| MENU ITEMS ||============================== //

// Dashboard
const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
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
  id: 'akademik',
  title: 'Akademik',
  type: 'group',
  children: [
    {
      id: 'manajemen-akademik',
      title: 'Manajemen Akademik',
      type: 'collapse',
      icon: icons.IconBook,
      children: [
        {
          id: 'input-nilai',
          title: 'Input Nilai',
          type: 'item',
          url: '/akademik/input-nilai'
        },
        {
          id: 'e-rapor',
          title: 'E-Rapor',
          type: 'item',
          url: '/akademik/e-rapor'
        },
        {
          id: 'absensi',
          title: 'Absensi Siswa',
          type: 'item',
          url: '/akademik/absensi'
        }
      ]
    }
  ]
};

// Kurikulum
const kurikulum = {
  id: 'kurikulum',
  title: 'Kurikulum',
  type: 'group',
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
          url: '/kurikulum/jadwal'
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
  children: [
    {
      id: 'user-management',
      title: 'User & Role',
      type: 'collapse',
      icon: icons.IconUser,
      children: [
        {
          id: 'data-user',
          title: 'Daftar User',
          type: 'item',
          url: '/user/list',
          icon: icons.IconUserAdd
        },
        {
          id: 'role-permission',
          title: 'Role & Permission',
          type: 'item',
          url: '/user/roles',
          icon: icons.IconSecurity
        }
      ]
    }
  ]
};

// Publikasi
const publikasi = {
  id: 'publikasi',
  title: 'Publikasi & Informasi',
  type: 'group',
  children: [
    {
      id: 'informasi',
      title: 'Informasi & Pengumuman',
      type: 'item',
      url: '/informasi/pengumuman',
      icon: icons.IconSpeakerphone
    },
    {
      id: 'kegiatan',
      title: 'Kegiatan Sekolah',
      type: 'item',
      url: '/publikasi/kegiatan',
      icon: icons.IconPhoto
    }
  ]
};

// ==============================|| EKSPOR MENU UTAMA ||============================== //
const menuItems = {
  items: [dashboard, manajemenData, akademik, kurikulum, manajemenUser, publikasi]
};

export default menuItems;

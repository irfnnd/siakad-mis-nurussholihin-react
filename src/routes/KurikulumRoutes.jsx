import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

// pages
const DataKelas = Loadable(lazy(() => import('views/pages/kurikulum/data-kelas/data-kelas-crud')));
const MataPelajaran = Loadable(lazy(() => import('views/pages/kurikulum/mata-pelajaran/mapel-crud')));
const JadwalPelajaran = Loadable(lazy(() => import('views/pages/kurikulum/jadwal-pelajaran/jadwal-pelajaran-crud')));

// ==============================|| MAIN ROUTES ||============================== //

const KurikulumRoutes = {
  path: '/kurikulum',
  element: <MainLayout />,
  children: [

    {
      path: 'data-kelas',
      title: 'Data Kelas',
      element: <DataKelas />
    },
    {
      path: 'mata-pelajaran',
      element: <MataPelajaran />
    },
    {
      path: 'jadwal-pelajaran',
      element: <JadwalPelajaran />
    }

  ]
};

export default KurikulumRoutes;

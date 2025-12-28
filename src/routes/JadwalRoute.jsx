import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

// pages
const DataKelas = Loadable(lazy(() => import('views/pages/kurikulum/data-kelas/data-kelas-crud')));
const MataPelajaran = Loadable(lazy(() => import('views/pages/kurikulum/mata-pelajaran/mapel-crud')));
const JadwalPelajaran = Loadable(lazy(() => import('views/pages/kurikulum/jadwal-pelajaran/jadwal-pelajaran-crud')));
const TahunSemesterCRUD = Loadable(lazy(() => import('views/pages/kurikulum/tahun-semester/tahun-semester')));

// ==============================|| MAIN ROUTES ||============================== //

const JadwalRoutes = {
  path: '/jadwal',
  element: <MainLayout />,
  children: [

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

export default JadwalRoutes;

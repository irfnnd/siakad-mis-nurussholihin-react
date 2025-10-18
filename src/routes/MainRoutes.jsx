import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

// pages
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/default')));
const SiswaCRUD = Loadable(lazy(() => import('views/pages/data-master/data-siswa/data-siswa-crud')));
const DataKelas = Loadable(lazy(() => import('views/pages/kurikulum/data-kelas/data-kelas-crud')));
const DataPegawai = Loadable(lazy(() => import('views/pages/data-master/data-pegawai/data-pegawai-crud')));

// utils
const UtilsTypography = Loadable(lazy(() => import('views/components/Typography')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/dashboard',
      element: <DashboardDefault />
    },
    {
      path: '/data/siswa',
      element: <SiswaCRUD />
    },
    {
      path: '/data/pegawai',
      element: < DataPegawai/>
    },
    {
      path: 'components',
      children: [
        {
          path: 'typography',
          element: <UtilsTypography />
        }
      ]
    }
  ]
};
// const KurikulumRoutes = {
//   path: '/kurikulum',
//   element: <MainLayout />,
//   children: [

//     {
//       path: '/data-kelas',
//       element: <DataKelas />
//     },
//   ]
// };

export default MainRoutes;

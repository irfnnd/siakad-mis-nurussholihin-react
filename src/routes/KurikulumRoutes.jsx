import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

// pages
const DataKelas = Loadable(lazy(() => import('views/pages/kurikulum/data-kelas/data-kelas-crud')));

// ==============================|| MAIN ROUTES ||============================== //

const KurikulumRoutes = {
  path: '/kurikulum',
  element: <MainLayout />,
  children: [

    {
      path: 'data-kelas',
      element: <DataKelas />
    },
  ]
};

export default KurikulumRoutes;

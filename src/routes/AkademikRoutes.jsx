import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layouts/MainLayout';

const HalamanNilaiSiswa = Loadable(lazy(() => import('views/pages/akademik/nilai-siswa/nilai-siswa')));
const HalamanRaporSiswa = Loadable(lazy(() => import('views/pages/akademik/e-rapor/rapor-siswa')));
const HalamanAbsensiSiswa = Loadable(lazy(() => import('views/pages/akademik/absensi/absensi-siswa')));

// ==============================|| MAIN ROUTES ||============================== //

const AkademikRoutes = {
    path: '/akademik',
    element: <MainLayout />,
    children: [
        {
            path: 'nilai-siswa',
            element: <HalamanNilaiSiswa />
        },
        {
            path: 'rapor-siswa',
            element: <HalamanRaporSiswa />
        },
        {
            path: 'absensi-siswa',
            element: <HalamanAbsensiSiswa />
        }
    ]
};

export default AkademikRoutes;
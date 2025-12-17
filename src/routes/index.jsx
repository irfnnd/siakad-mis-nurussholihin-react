import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import KurikulumRoutes from './KurikulumRoutes';
import AkademikRoutes from './AkademikRoutes';
import DataRoutes from './DataRoutes';
import UserRoutes from './UserRoutes';
import AuthRoutes from './AuthRoutes'; // Ini rute publik (login, register, dll)

// Import "Penjaga" yang baru kita buat
import ProtectedRoutes from './ProtectedRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  // --- GRUP 1: RUTE PUBLIK ---
  // Rute di sini tidak akan dicek tokennya.
  AuthRoutes, 

  // --- GRUP 2: RUTE PRIVAT / TERPROTEKSI ---
 {
  element: <ProtectedRoutes allowedRoles={['admin']} />,
  children: [
    DataRoutes,
    KurikulumRoutes,
    UserRoutes
  ]
},
// Penjaga 2 (Admin dan Guru)
{
  element: <ProtectedRoutes allowedRoles={['guru', 'admin']} />,
  children: [
    MainRoutes,
    AkademikRoutes
  ]
}
], {
});

export default router;
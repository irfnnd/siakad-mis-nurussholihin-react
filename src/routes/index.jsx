import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import KurikulumRoutes from './KurikulumRoutes';
import AkademikRoutes from './AkademikRoutes';
import DataRoutes from './DataRoutes';
import UserRoutes from './UserRoutes';
import AuthRoutes from './AuthRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, KurikulumRoutes, AkademikRoutes, DataRoutes,  AuthRoutes, UserRoutes], {
  basename: import.meta.env.VITE_APP_BASE_URL
});

export default router;

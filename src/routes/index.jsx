import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import PagesRoutes from './PagesRoutes';
import KurikulumRoutes from './KurikulumRoutes';
import AkademikRoutes from './AkademikRoutes';
import DataRoutes from './DataRoutes';
import AuthRoutes from './AuthRoutes'; 

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, PagesRoutes, KurikulumRoutes, AkademikRoutes, DataRoutes,  AuthRoutes], {
  basename: import.meta.env.VITE_APP_BASE_URL
});

export default router;

import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import PagesRoutes from './PagesRoutes';
import KurikulumRoutes from './KurikulumRoutes';
import AkademikRoutes from './AkademikRoutes';
import DataRoutes from './DataRoutes';
import WebSekolahRoutes from './WebSekolahRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, PagesRoutes, KurikulumRoutes, AkademikRoutes, DataRoutes, WebSekolahRoutes], {
  basename: import.meta.env.VITE_APP_BASE_URL
});

export default router;

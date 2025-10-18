import { RouterProvider } from 'react-router-dom';

// project imports
import ThemeCustomization from './themes';
// import SiswaCRUD from './SiswaCRUD';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import router from 'routes';

function App() {
  return (
    <ThemeCustomization>
      <RouterProvider router={router} />
    </ThemeCustomization>
  );
}

export default App;

import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// third party
import { useForm } from 'react-hook-form';

// project imports
import { authService } from '../../services/authService';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ==============================|| AUTH - LOGIN ||============================== //

export default function AuthLogin({ inputSx }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', data);

      const result = await authService.login(data.username, data.password);
      if (result.success) {
        console.log('Login successful, redirecting to dashboard...');
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  // Simple validation schema for react-hook-form
  const validationSchema = {
    username: {
      required: 'Username harus diisi',
      minLength: {
        value: 3,
        message: 'Username minimal 3 karakter'
      }
    },
    password: {
      required: 'Password harus diisi',
      minLength: {
        value: 6,
        message: 'Password minimal 6 karakter'
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack sx={{ gap: 3, mb: 2 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Username Field */}
        <Box>
          <TextField
            id="username"
            variant="outlined"
            {...register('username', validationSchema.username)}
            placeholder="Masukkan username"
            fullWidth
            label="Username"
            error={Boolean(errors.username)}
            disabled={loading}
            sx={inputSx}
            autoComplete="username"
          />
          {errors.username?.message && <FormHelperText error>{errors.username.message}</FormHelperText>}
        </Box>

        {/* Password Field */}
        <Box>
          <FormControl fullWidth error={Boolean(errors.password)}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              {...register('password', validationSchema.password)}
              id="password"
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              label="Password"
              placeholder="Masukkan password"
              disabled={loading}
              autoComplete="current-password"
              endAdornment={
                <InputAdornment
                  position="end"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => !loading && setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                </InputAdornment>
              }
              sx={inputSx}
            />
          </FormControl>
          {errors.password?.message && <FormHelperText error>{errors.password.message}</FormHelperText>}
        </Box>
      </Stack>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{
          minWidth: 120,
          mt: { xs: 2, sm: 3 },
          height: '48px',
          '& .MuiButton-endIcon': { ml: 1 }
        }}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? 'Loading...' : 'Login'}
      </Button>

      {/* Demo Credentials Info */}
      {/* <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <FormHelperText sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <strong>Demo Credentials:</strong><br />
          Username: admin<br />
          Password: password123
        </FormHelperText>
      </Box> */}
    </form>
  );
}

AuthLogin.propTypes = {
  inputSx: PropTypes.any
};

// project imports
import CommonAuthLayout from './CommonAuthLayout';
import AuthLogin from 'sections/auth/AuthLogin';

// ==============================|| LOGIN ||============================== //

export default function Login() {
  return (
    <CommonAuthLayout
      title="Sign in"
      subHeading="To keep connected with us."
    >
      {/* Login form */}
      <AuthLogin />
    </CommonAuthLayout>
  );
}

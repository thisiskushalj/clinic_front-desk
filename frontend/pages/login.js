import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    setError('');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        { username, password }
      );
      const token = response.data.access_token;

      if (token) {
        localStorage.setItem('token', token);

        // Confirm token is saved before redirecting
        if (localStorage.getItem('token')) {
          console.log('Token stored. Redirecting...');
          router.replace('/'); // Use replace to prevent back navigation
        } else {
          console.error('Token not saved.');
          setError('Something went wrong. Try again.');
        }
      } else {
        setError('No token received from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row" style={{ width: '60%' }}>

        {/* Existing component */}
        <div className="flex h-[700px] w-full">

          {/* Left Image Section */}
          <div className="w-full hidden md:inline-block">
            <img
              className="h-full object-cover"
              src='/login_image.jpg'
              alt="leftSideImage"
            />
          </div>

          {/* Login Form Section */}
          <div className="w-full flex flex-col items-center justify-start px-6 gap-5">
            <div className="flex justify-center flex-col items-center mb-4 mt-10 gap-3">
              <img
                src="/logo.png"
                alt="Clinic Logo"
                className="h-30 w-auto"
              />
              <h2 className='text-4xl text-[#0E87CA] font-semibold'>Medify Hospital</h2>
            </div>
            <form className="md:w-96 w-80 flex flex-col items-center justify-center">
              <h2 className="text-[30px] text-gray-900 font-medium mb-6">Front-Desk Sign in</h2>
              <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
                </svg>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
              </div>
              <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                </svg>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
              </div>
              <button onClick={handleLogin} type="submit" className="mt-8 w-full h-11 rounded-full text-white text-[19px] bg-[#0E87CA] hover:opacity-90 transition-opacity cursor-pointer">
                Login
              </button>
              {error && <p className='text-red-600 text-sm mt-2'>{error}</p>}
            </form>
            <p className="text-sm text-gray-500 mt-4 text-center">
            <strong>Demo Credentials</strong><br />
            Username: <code className="bg-gray-100 px-1 rounded">admin</code> <br />
            Password: <code className="bg-gray-100 px-1 rounded">admin123</code>
          </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
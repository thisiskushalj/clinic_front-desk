import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '@/utils/auth';
import { Bell, Settings } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md py-2 px-8 flex justify-between items-center">
      <div className="flex justify-center flex-row items-center gap-4">
        <img
          src="/logo.png"
          alt="Clinic Logo"
          className="h-18 w-auto"
        />
        <div>
          <h2 className='text-2xl text-[#0E87CA] font-semibold'>Medify Hospital</h2>
          <h2 className='text-[17px] text-gray-500 font-semibold'>Front Desk System</h2>
        </div>
      </div>
      <div className='flex gap-8 justify-center items-center mr-6'>
        <Bell className='text-gray-700'/>
        <Settings className='text-gray-700'/>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-1 rounded-2xl hover:bg-red-700 font-semibold cursor-pointer"
        >
          Logout
        </button>
      </div>


    </nav>
  );
}
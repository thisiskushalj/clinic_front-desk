import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '@/utils/auth';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <div className="space-x-6">
        <Link href="/" className="text-blue-600 font-semibold hover:underline">
          Home
        </Link>
        <Link href="/queue" className="text-blue-600 font-semibold hover:underline">
          Queue
        </Link>
        <Link href="/doctors" className="text-blue-600 font-semibold hover:underline">
          Doctors
        </Link>
        <Link href="/appointments" className="text-blue-600 font-semibold hover:underline">
          Appointments
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
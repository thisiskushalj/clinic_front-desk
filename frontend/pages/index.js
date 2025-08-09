import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn, logout } from '@/utils/auth';
import Navbar from '@/components/Navbar';
import { Activity, Circle, Clipboard, Clock3, StickyNote, User, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, []);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { name: "Overview", path: "/" },
    { name: "Queue", path: "/queue" },
    { name: "Appointments", path: "/appointments" },
    { name: "Doctors", path: "/doctors" },
  ];

  const announcements = [
    "Dr. Hrushitha will be on leave tomorrow.",
    "System maintenance is scheduled on 15th Aug, 11 AM to 2 PM.",
    "New Patient guidelines have been updated.",
    "The next 'Health Camp' is scheduled on 20 Aug, 2025.",
  ];

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Dashboard</h1>
            <p className="text-gray-400 font-semibold">{new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
          <div className="flex gap-3">
            <button className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 flex items-center hover:bg-gray-100">
              <Activity className='w-5 mr-3' />System Status
            </button>
            <button className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600">
              <StickyNote className='w-5 mr-3' />View Reports
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`pb-2 ${activeTab === tab.path.replace("/", "")
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold cursor-pointer"
                : "text-gray-500 font-semibold cursor-pointer"
                }`}
              onClick={() => {
                setActiveTab(tab.path.replace("/", ""));
                router.push(tab.path); // navigate to page
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Patients in Queue */}
          <div className="bg-[#FDF9F1] p-5 rounded-xl border border-yellow-500">
            <div className='flex justify-between'>
              <h3 className="text-gray-500 font-semibold">Patients in Queue</h3>
              <User className='text-yellow-500' />
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-700">8</p>
            <p className="text-gray-500 text-sm">2 urgent cases</p>
            <p className="text-gray-500 text-sm mt-1"><span className='text-green-600'>+12% </span>from last week</p>
          </div>

          {/* Today's Appointments */}
          <div className="bg-[#F1F6FD] p-5 rounded-xl border border-blue-500">
            <div className='flex justify-between'>
              <h3 className="text-gray-500 font-semibold">Today's Appointments</h3>
              <Clipboard className='text-blue-500' />
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-700">24</p>
            <p className="text-gray-500 text-sm">
              6 completed, 3 in progress
            </p>
            <p className="text-gray-500 text-sm mt-1"><span className='text-green-600'>+8% </span>from last week</p>
          </div>

          {/* Doctors Available */}
          <div className="bg-[#F2FCF6] p-5 rounded-xl border border-green-600">
            <div className='flex justify-between'>
              <h3 className="text-gray-500 font-semibold">Doctors Available</h3>
              <UserCheck className='text-green-600' />
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-700">12</p>
            <p className="text-gray-500 text-sm">3 specializations</p>
          </div>

          {/* Average Wait Time */}
          <div className="bg-[#FBE4E4] p-5 rounded-xl border border-red-600">
            <div className='flex justify-between'>
              <h3 className="text-gray-500 font-semibold">Average Wait Time</h3>
              <Clock3 className='text-red-600' />
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-700">18 min</p>
            <p className="text-gray-500 text-sm">Down from yesterday</p>
            <p className="text-gray-500 text-sm mt-1"><span className='text-red-600'>-5% </span>from last week</p>
          </div>
        </div>

        <div className="w-full bg-white border rounded-lg shadow-sm p-4">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-400 pb-2 mb-3">
            Announcements
          </h2>

          {/* Horizontal List */}
          <div className="flex flex-col flex-wrap gap-6">
            {announcements.map((note, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border border-gray-100 rounded-md px-4 py-2 bg-gray-100 hover:shadow-md transition-shadow"
              >
                <Circle size={10} className="text-gray-500 fill-gray-500" />
                <span className="text-black text-[15px]">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios';
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle,
  Plus,
  RotateCw,
  X,
  Search
} from 'lucide-react';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Booking form
  const [form, setForm] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    time: '',
  });

  // Search UI
  const [searchType, setSearchType] = useState('doctor'); // doctor | patient
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Reschedule modal
  const [rescheduleData, setRescheduleData] = useState(null);

  // Booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Doctors modal open state
  const [doctorsModalOpen, setDoctorsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  async function fetchDoctors() {
    try {
      const res = await axios.get('/doctors');
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setDoctors([]);
    }
  }

  async function fetchAppointments() {
    try {
      const res = await axios.get('/appointments');
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setAppointments([]);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleBook() {
    const { patientName, doctorName, date, time } = form;
    if (!patientName || !doctorName || !date || !time) return;

    try {
      await axios.post('/appointments', {
        patientName,
        doctorName,
        date,
        time,
        status: 'scheduled',
      });
      setForm({ patientName: '', doctorName: '', date: '', time: '' });
      setBookingModalOpen(false);
      if (searchResults.length > 0) {
        runSearch();
      } else {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  }

  // Now handleCancel only updates status to 'cancelled'
  async function handleCancel(id) {
    try {
      await axios.put(`/appointments/${id}`, { status: 'cancelled' });
      if (searchResults.length > 0) runSearch();
      else fetchAppointments();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  }

  // New: Handle marking appointment as completed
  async function handleComplete(id) {
    try {
      await axios.put(`/appointments/${id}`, { status: 'completed' });
      if (searchResults.length > 0) runSearch();
      else fetchAppointments();
    } catch (err) {
      console.error('Mark completed failed:', err);
    }
  }

  async function handleReschedule() {
    if (!rescheduleData) return;
    try {
      await axios.put(`/appointments/${rescheduleData.id}`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
      });
      setRescheduleData(null);
      if (searchResults.length > 0) runSearch();
      else fetchAppointments();
    } catch (err) {
      console.error('Reschedule failed:', err);
    }
  }

  // --- SEARCH LOGIC ---
  useEffect(() => {
    setSearchResults([]);
    setSearchError('');
  }, [searchType, searchValue]);

  function runSearch() {
    const value = searchValue.trim().toLowerCase();
    if (!value) {
      setSearchError('Please enter a search term');
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError('');

    let filtered = [];
    if (searchType === 'doctor') {
      filtered = appointments.filter(appt =>
        appt.doctorName.toLowerCase().includes(value)
      );
    } else if (searchType === 'patient') {
      filtered = appointments.filter(appt =>
        appt.patientName.toLowerCase().includes(value)
      );
    }

    if (filtered.length === 0) {
      setSearchError('No appointments found');
    }
    setSearchResults(filtered);
    setSearching(false);
  }

  function clearSearchUI() {
    setSearchValue('');
    setSearchResults([]);
    setSearchError('');
  }

  const displayedAppointments = searchResults.length > 0 || searchError
    ? searchResults
    : appointments;

  // Stats
  const totalToday = appointments.length;
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const inProgressCount = appointments.filter(a => a.status === 'in progress').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="text-gray-700" size={28} />
          <h1 className="text-2xl font-bold text-gray-700">Appointments</h1>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-gray-700">
          <StatCard icon={<CalendarDays className="text-blue-700" />} label="Total Today" value={totalToday} />
          <StatCard icon={<Clock className="text-red-700" />} label="Scheduled" value={scheduledCount} />
          <StatCard icon={<User className="text-yellow-600" />} label="In Progress" value={inProgressCount} />
          <StatCard icon={<CheckCircle className="text-green-700" />} label="Completed" value={completedCount} />
        </div>

        {/* Combined Search + Book + Appointment List container */}
        <div className="bg-white p-6 rounded shadow-md text-gray-700">
          {/* Top bar: Search left + Show Doctors + Book button right */}
          <div className="flex justify-between items-center mb-6">
            {/* Search Panel */}
            <div className="flex gap-2 items-center">
              <div className='flex gap-2 justify-center items-center'>
                <Search />
                <h2 className="text-xl font-semibold mr-4">Search Appointments</h2>
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'doctor' ? 'Enter doctor name' : 'Enter patient name'}
                className="border p-2 rounded flex-1 min-w-[250px]"
              />
              <button
                onClick={runSearch}
                className="bg-[#0E87CA] text-white px-4 py-2 rounded cursor-pointer"
              >
                Search
              </button>
              <button
                onClick={clearSearchUI}
                className="bg-gray-200 px-3 py-2 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Show All Available Doctors button */}
            <button
              onClick={() => setDoctorsModalOpen(true)}
              className="bg-[#0E87CA] text-white px-5 py-2 rounded ml-4 font-semibold cursor-pointer"
            >
              Available Doctors
            </button>

            {/* Book New Appointment button */}
            <button
              onClick={() => setBookingModalOpen(true)}
              className="bg-[#0E87CA] text-white px-5 py-2 rounded ml-4 flex items-center gap-2 font-semibold cursor-pointer"
            >
              <Plus size={20} /> Book New Appointment
            </button>
          </div>

          {/* Search messages */}
          {searching && <p className="text-blue-600 mb-3">Searching...</p>}
          {searchError && <p className="text-red-500 mb-3">{searchError}</p>}

          {/* Appointment List */}
          <div>
            {displayedAppointments.length === 0 ? (
              <p className="text-gray-500">No appointments to display.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="border-b p-2">Patient</th>
                    <th className="border-b p-2">Doctor</th>
                    <th className="border-b p-2">Date</th>
                    <th className="border-b p-2">Time</th>
                    <th className="border-b p-2">Status</th>
                    <th className="border-b p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="border-b p-2">{appt.patientName}</td>
                      <td className="border-b p-2">{appt.doctorName}</td>
                      <td className="border-b p-2">{appt.date}</td>
                      <td className="border-b p-2">{appt.time}</td>
                      <td className="border-b p-2 capitalize">{appt.status}</td>
                      <td className="border-b p-2 space-x-2">
                        <div className='flex gap-2 items-center'>
                          <button
                            onClick={() => setRescheduleData(appt)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                            title="Reschedule"
                          >
                            <RotateCw size={14} /> Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(appt.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <X size={14} /> Cancel
                          </button>
                          <button
                            onClick={() => handleComplete(appt.id)}
                            className="bg-[#5AB32E] text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                            title="Mark as Completed"
                          >
                            <CheckCircle size={14} /> Completed
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        {bookingModalOpen && (
          <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Book New Appointment</h2>
              <div className="space-y-3">
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  className="border p-2 rounded w-full text-gray-600"
                />
                <select
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleChange}
                  className="border p-2 rounded w-full text-gray-600"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-gray-600"
                  />
                  <input
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    className="border p-2 rounded w-36 text-gray-600"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="bg-red-600 px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBook}
                    className="bg-[#5AB32E] text-white px-4 py-2 rounded flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Plus size={16} /> Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleData && (
          <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Reschedule Appointment</h2>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
                className="border p-2 mb-3 rounded w-full text-gray-600"
              />
              <input
                type="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, time: e.target.value })
                }
                className="border p-2 mb-4 rounded w-full text-gray-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRescheduleData(null)}
                  className="bg-red-600 font-semibold px-4 py-2 rounded cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleReschedule}
                  className="bg-[#5AB32E] font-semibold text-white px-4 py-2 rounded cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Modal */}
        {doctorsModalOpen && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Available Doctors</h2>
                <button
                  onClick={() => setDoctorsModalOpen(false)}
                  className="text-red-600 font-semibold text-lg cursor-pointer"
                  aria-label="Close doctors modal"
                >
                  <X size={24} />
                </button>
              </div>
              {doctors.length === 0 ? (
                <p className="text-gray-500">No doctors available.</p>
              ) : (
                <table className="w-full border-collapse border border-gray-300 text-gray-700">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Name</th>
                      <th className="border border-gray-300 p-2 text-left">Specialization</th>
                      <th className="border border-gray-300 p-2 text-left">Gender</th>
                      <th className="border border-gray-300 p-2 text-left">Location</th>
                      <th className="border border-gray-300 p-2 text-left">Experience (Years)</th>
                      <th className="border border-gray-300 p-2 text-left">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="even:bg-gray-50">
                        <td className="border border-gray-300 p-2">{doc.name}</td>
                        <td className="border border-gray-300 p-2">{doc.specialization}</td>
                        <td className="border border-gray-300 p-2">{doc.gender}</td>
                        <td className="border border-gray-300 p-2">{doc.location}</td>
                        <td className="border border-gray-300 p-2">{doc.experience}</td>
                        <td className="border border-gray-300 p-2">{doc.availability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  );
}
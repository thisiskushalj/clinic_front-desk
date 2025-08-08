import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios';
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    time: '',
  });
  const [rescheduleData, setRescheduleData] = useState({ id: null, date: '', time: '' });

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await axios.get('/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };

    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBook = async () => {
    const { patientName, doctorName, date, time } = form;
    if (!patientName || !doctorName || !date || !time) return;

    try {
      await axios.post('/appointments', {
        patientName,
        doctorName,
        date,
        time,
        status: 'Booked',
      });

      setForm({ patientName: '', doctorName: '', date: '', time: '' });

      const res = await axios.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleReschedule = async (id, newDate, newTime) => {
    try {
      await axios.put(`/appointments/${id}`, { date: newDate, time: newTime });

      const res = await axios.get('/appointments');
      setAppointments(res.data);

      setRescheduleData({ id: null, date: '', time: '' });
    } catch (err) {
      console.error('Reschedule failed:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Appointment Management</h1>

        {/* Booking Form */}
        <div className="bg-white p-4 rounded shadow-md mb-6 text-black">
          <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
          <div className="space-y-3">
            <input
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              placeholder="Patient Name"
              className="border p-2 rounded w-full"
            />
            <select
              name="doctorName"
              value={form.doctorName}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} - {doc.specialization}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleBook}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* Appointment Table */}
        <div className="bg-white p-4 rounded shadow-md text-black">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <p>No appointments booked yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">Patient</th>
                  <th className="border-b p-2">Doctor</th>
                  <th className="border-b p-2">Date</th>
                  <th className="border-b p-2">Time</th>
                  <th className="border-b p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="border-b p-2">{appt.patientName}</td>
                    <td className="border-b p-2">{appt.doctorName}</td>
                    <td className="border-b p-2">{appt.date}</td>
                    <td className="border-b p-2">{appt.time}</td>
                    <td className="border-b p-2 space-x-2">
                      <button
                        onClick={() =>
                          setRescheduleData({
                            id: appt.id,
                            date: appt.date,
                            time: appt.time,
                          })
                        }
                        className="bg-yellow-400 px-2 py-1 rounded text-sm text-white"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Reschedule Form */}
          {rescheduleData.id && (
            <div className="mt-6 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Reschedule Appointment</h3>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
                className="border p-2 mr-2 rounded"
              />
              <input
                type="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, time: e.target.value })
                }
                className="border p-2 mr-2 rounded"
              />
              <button
                onClick={() =>
                  handleReschedule(
                    rescheduleData.id,
                    rescheduleData.date,
                    rescheduleData.time
                  )
                }
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
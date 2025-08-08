import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios'; // ✅ use the configured axios instance
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';

export default function QueuePage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctors, setDoctors] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [doctorRes, queueRes] = await Promise.all([
          axios.get('/doctors'),
          axios.get('/queue'),
        ]);

        // ✅ Make sure responses are arrays
        setDoctors(Array.isArray(doctorRes.data) ? doctorRes.data : []);
        setPatients(Array.isArray(queueRes.data) ? queueRes.data : []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setDoctors([]); // fallback to empty array on error
        setPatients([]);
      }
    };

    fetchData();
  }, [token]);

  const addPatient = async () => {
    if (!patientName || !doctorName) return;
    const newPosition = patients.length + 1;

    try {
      const res = await axios.post('/queue', {
        patientName,
        doctorName,
        position: newPosition,
        status: 'Waiting',
      });

      setPatients([...patients, res.data]);
      setPatientName('');
      setDoctorName('');
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/queue/${id}`, { status: newStatus });
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Queue Management</h1>

        {/* Add Patient */}
        <div className="bg-white p-4 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Add Walk-in Patient</h2>
          <input
            type="text"
            placeholder="Patient Name"
            className="border p-2 mr-2 mb-2 rounded w-60 text-black"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <select
            className="border p-2 mr-2 mb-2 rounded w-60 text-black"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.name}>
                {doc.name} - {doc.specialization}
              </option>
            ))}
          </select>
          <button
            onClick={addPatient}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        {/* Queue Table */}
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Current Queue</h2>
          {patients.length === 0 ? (
            <p>No patients in queue.</p>
          ) : (
            <table className="w-full text-left text-black">
              <thead>
                <tr>
                  <th className="border-b p-2">Queue No</th>
                  <th className="border-b p-2">Patient</th>
                  <th className="border-b p-2">Doctor</th>
                  <th className="border-b p-2">Status</th>
                  <th className="border-b p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="border-b p-2">{patient.position}</td>
                    <td className="border-b p-2">{patient.patientName}</td>
                    <td className="border-b p-2">{patient.doctorName}</td>
                    <td className="border-b p-2">{patient.status}</td>
                    <td className="border-b p-2 space-x-2">
                      <button
                        onClick={() => updateStatus(patient.id, 'Waiting')}
                        className="text-sm bg-yellow-400 px-2 py-1 rounded text-white"
                      >
                        Waiting
                      </button>
                      <button
                        onClick={() => updateStatus(patient.id, 'In Consultation')}
                        className="text-sm bg-blue-400 px-2 py-1 rounded text-white"
                      >
                        In Consultation
                      </button>
                      <button
                        onClick={() => updateStatus(patient.id, 'Completed')}
                        className="text-sm bg-green-500 px-2 py-1 rounded text-white"
                      >
                        Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
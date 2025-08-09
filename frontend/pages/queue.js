import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios';
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';
import { Clock, UserCheck, Users, CheckCircle } from 'lucide-react';

export default function QueuePage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctors, setDoctors] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 🔹 Auth check
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, []);

  // 🔹 Fetch doctors + queue data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [doctorRes, queueRes] = await Promise.all([
          axios.get('/doctors'),
          axios.get('/queue'),
        ]);

        setDoctors(Array.isArray(doctorRes.data) ? doctorRes.data : []);
        setPatients(Array.isArray(queueRes.data) ? queueRes.data : []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setDoctors([]);
        setPatients([]);
      }
    };

    fetchData();
  }, [token]);

  // 🔹 Add patient
  const addPatient = async () => {
    if (!patientName || !doctorName) return;

    try {
      const res = await axios.post('/queue', {
        patientName,
        doctorName,
        status: 'Waiting',
      });

      setPatients((prev) => [...prev, res.data]);
      setPatientName('');
      setDoctorName('');
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  // 🔹 Update status (and refresh queue after)
  const updateStatus = async (id, newStatus) => {
    const prevPatients = [...patients];

    setPatients((prev) => {
      // Find the target patient
      const target = prev.find(p => p.id === id);
      if (!target) return prev;

      let updated = prev.map((p) =>
        p.id === id
          ? { ...p, status: newStatus, position: newStatus === "In Consultation" ? 0 : p.position }
          : p
      );

      if (newStatus === "In Consultation") {
        // Shift down positions of patients with position > target.position
        updated = updated.map((p) => {
          if (p.id !== id && p.status === "Waiting" && p.position > target.position) {
            return { ...p, position: p.position - 1 };
          }
          return p;
        });
      }

      // Do NOT shift positions when status is changed to Completed
      // So no change here when newStatus === 'Completed'

      return updated;
    });

    try {
      await axios.put(`/queue/${id}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      setPatients(prevPatients);
    }
  };

  const clearQueue = () => {
    setPatients([]); // instantly clear the UI
  };

  // Stats
  const waitingCount = patients.filter((p) => p.status === 'Waiting').length;
  const withDoctorCount = patients.filter((p) => p.status === 'In Consultation').length;
  const totalCount = patients.length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className='flex justify-between'>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="text-gray-700 font-bold" size={28} />
            <h1 className="text-3xl font-bold text-gray-700">Queue</h1>
          </div>
          <button
            onClick={clearQueue}
            className="bg-red-500 text-white font-semibold px-3 rounded hover:bg-red-600 mb-4 cursor-pointer"
          >
            Clear Queue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-semibold">Waiting</p>
              <p className="text-2xl font-bold text-gray-700">{waitingCount}</p>
            </div>
            <Clock className="text-red-600" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-semibold">With Doctor</p>
              <p className="text-2xl font-bold text-gray-700">{withDoctorCount}</p>
            </div>
            <UserCheck className="text-blue-700" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-semibold">Total Queue</p>
              <p className="text-2xl font-bold text-gray-700">{totalCount}</p>
            </div>
            <Users className="text-yellow-600" />
          </div>
        </div>

        {/* Add Walk-in Patient */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Add Walk-in Patient</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Patient Name"
              className="border border-gray-300 p-2 rounded w-full text-black"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <select
              className="border border-gray-300 p-2 rounded w-full text-black"
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
              className="bg-[#0E87CA] text-white font-semibold px-4 py-2 rounded w-full md:w-auto whitespace-nowrap cursor-pointer"
            >
              Add to Queue
            </button>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Patient Queue</h2>
          {patients.length === 0 ? (
            <p className="text-gray-500">No patients in queue.</p>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg"
                >
                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    {patient.status === 'Completed' ? (
                      <CheckCircle className="text-green-500 w-8 h-8" />
                    ) : (
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0E87CA] text-white font-semibold">
                        {patient.position}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-gray-700">{patient.patientName}</p>
                      <p className="text-sm text-gray-500">
                        Doctor: {patient.doctorName}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 md:mt-0">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${patient.status === 'Waiting'
                        ? 'bg-yellow-100 text-yellow-700'
                        : patient.status === 'In Consultation'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <button
                      onClick={() => updateStatus(patient.id, 'Waiting')}
                      className="text-sm bg-yellow-500 px-3 py-1 rounded text-white font-semibold cursor-pointer"
                    >
                      Waiting
                    </button>
                    <button
                      onClick={() => updateStatus(patient.id, 'In Consultation')}
                      className="text-sm bg-blue-500 px-3 py-1 rounded text-white font-semibold cursor-pointer"
                    >
                      With Doctor
                    </button>
                    <button
                      onClick={() => updateStatus(patient.id, 'Completed')}
                      className="text-sm bg-green-600 px-3 py-1 rounded text-white font-semibold cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios';
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    gender: '',
    location: '',
    availability: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, []);

  // Load all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const { name, specialization, gender, location, availability } = form;
    if (!name || !specialization) return;

    try {
      const res = await axios.post('/doctors', {
        name,
        specialization,
        gender,
        location,
        availability,
      });

      setDoctors([...doctors, res.data]);
      resetForm();
    } catch (err) {
      console.error('Add doctor failed:', err);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({ ...doctor });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/doctors/${editingId}`, form);

      const res = await axios.get('/doctors');
      setDoctors(res.data);

      resetForm();
      setEditingId(null);
    } catch (err) {
      console.error('Update doctor failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/doctors/${id}`);
      setDoctors(doctors.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      specialization: '',
      gender: '',
      location: '',
      availability: '',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Doctor Management</h1>

        {/* Add / Edit Form */}
        <div className="bg-white p-4 rounded shadow-md mb-6 text-black">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <div className="space-y-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 rounded w-full"
            />
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="border p-2 rounded w-full"
            />
            <input
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder="Gender"
              className="border p-2 rounded w-full"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location"
              className="border p-2 rounded w-full"
            />
            <input
              name="availability"
              value={form.availability}
              onChange={handleChange}
              placeholder="Availability (e.g. Mon-Fri, 9AM-5PM)"
              className="border p-2 rounded w-full"
            />
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className={`px-4 py-2 rounded text-white ${
                editingId ? 'bg-green-600' : 'bg-blue-500'
              }`}
            >
              {editingId ? 'Update Doctor' : 'Add Doctor'}
            </button>
          </div>
        </div>

        {/* Doctor List */}
        <div className="bg-white p-4 rounded shadow-md text-black">
          <h2 className="text-xl font-semibold mb-4">Doctor List</h2>
          {doctors.length === 0 ? (
            <p>No doctors added yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">Name</th>
                  <th className="border-b p-2">Specialization</th>
                  <th className="border-b p-2">Gender</th>
                  <th className="border-b p-2">Location</th>
                  <th className="border-b p-2">Availability</th>
                  <th className="border-b p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td className="border-b p-2">{doc.name}</td>
                    <td className="border-b p-2">{doc.specialization}</td>
                    <td className="border-b p-2">{doc.gender}</td>
                    <td className="border-b p-2">{doc.location}</td>
                    <td className="border-b p-2">{doc.availability}</td>
                    <td className="border-b p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="bg-yellow-400 px-2 py-1 rounded text-sm text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-red-500 px-2 py-1 rounded text-sm text-white"
                      >
                        Delete
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
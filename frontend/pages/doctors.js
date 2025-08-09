import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from '@/utils/axios';
import { isLoggedIn } from '@/utils/auth';
import Navbar from '@/components/Navbar';
import { Stethoscope } from 'lucide-react';

export default function DoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Add/Edit form state (editing inline, add via modal)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    gender: '',
    location: '',
    availability: '',
    experience: '',
  });

  // Modal open state for adding new doctor
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Search and filters state
  const [searchName, setSearchName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

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

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = doctors;

    if (searchName.trim()) {
      const lowerName = searchName.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(lowerName)
      );
    }
    if (filterLocation) {
      filtered = filtered.filter((doc) => doc.location === filterLocation);
    }
    if (filterSpecialization) {
      filtered = filtered.filter((doc) => doc.specialization === filterSpecialization);
    }
    if (filterAvailability) {
      filtered = filtered.filter((doc) => doc.availability === filterAvailability);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchName, filterLocation, filterSpecialization, filterAvailability]);

  // Handle input change for add/edit form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add doctor from modal
  const handleAdd = async () => {
    const { name, specialization, gender, location, availability, experience } = form;
    if (!name || !specialization) return;

    try {
      const res = await axios.post('/doctors', {
        name,
        specialization,
        gender,
        location,
        availability,
        experience,
      });

      setDoctors([...doctors, res.data]);
      resetForm();
      setAddModalOpen(false);
    } catch (err) {
      console.error('Add doctor failed:', err);
    }
  };

  // Start editing inline
  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({ ...doctor });
  };

  // Update doctor inline
  const handleUpdate = async () => {
    try {
      await axios.put(`/doctors/${editingId}`, form);

      // Refresh doctor list
      const res = await axios.get('/doctors');
      setDoctors(res.data);

      resetForm();
      setEditingId(null);
    } catch (err) {
      console.error('Update doctor failed:', err);
    }
  };

  // Delete doctor
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/doctors/${id}`);
      setDoctors(doctors.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      specialization: '',
      gender: '',
      location: '',
      availability: '',
      experience: '',
    });
  };

  // Extract unique filter options from doctors for dropdowns
  const uniqueLocations = useMemo(() => {
    const locs = doctors.map((d) => d.location).filter(Boolean);
    return [...new Set(locs)];
  }, [doctors]);

  const uniqueSpecializations = useMemo(() => {
    const specs = doctors.map((d) => d.specialization).filter(Boolean);
    return [...new Set(specs)];
  }, [doctors]);

  const uniqueAvailabilities = useMemo(() => {
    const avails = doctors.map((d) => d.availability).filter(Boolean);
    return [...new Set(avails)];
  }, [doctors]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8 text-black">
        <div className='flex items-center gap-3 mb-6'>
          <Stethoscope className="text-gray-700" size={28}/>
          <h1 className="text-3xl font-bold text-gray-700">Doctors</h1>
        </div>

        {/* Search + Filters + Add Button */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6">
          {/* Search by name */}
          <input
            type="text"
            placeholder="Search doctors by name..."
            className="border p-2 rounded w-full md:max-w-xs"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          {/* Location filter */}
          <select
            className="border p-2 rounded w-full md:max-w-xs"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">Filter by Location</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Specialization filter */}
          <select
            className="border p-2 rounded w-full md:max-w-xs"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            <option value="">Filter by Specialization</option>
            {uniqueSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <select
            className="border p-2 rounded w-full md:max-w-xs"
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
          >
            <option value="">Filter by Availability</option>
            {uniqueAvailabilities.map((avail) => (
              <option key={avail} value={avail}>
                {avail}
              </option>
            ))}
          </select>

          {/* Add new doctor button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#0E87CA] text-white px-4 py-2 rounded mt-2 md:mt-0 whitespace-nowrap cursor-pointer"
          >
            Add New Doctor
          </button>
        </div>

        {/* Inline Edit Form */}
        {editingId && (
          <div className="bg-white p-4 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Edit Doctor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                placeholder="Availability"
                className="border p-2 rounded w-full"
              />
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="Experience (years)"
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded border border-gray-400 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded bg-green-600 font-semibold text-white cursor-pointer"
              >
                Update Doctor
              </button>
            </div>
          </div>
        )}

        {/* Doctor List */}
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Doctors List</h2>
          {filteredDoctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Specialization</th>
                  <th className="border border-gray-300 p-2">Gender</th>
                  <th className="border border-gray-300 p-2">Location</th>
                  <th className="border border-gray-300 p-2">Availability</th>
                  <th className="border border-gray-300 p-2">Experience (yrs)</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <td className="border border-gray-300 p-2">{doc.name}</td>
                    <td className="border border-gray-300 p-2">{doc.specialization}</td>
                    <td className="border border-gray-300 p-2">{doc.gender}</td>
                    <td className="border border-gray-300 p-2">{doc.location}</td>
                    <td className="border border-gray-300 p-2">{doc.availability}</td>
                    <td className="border border-gray-300 p-2">{doc.experience || '-'}</td>
                    <td className="border border-gray-300 p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="bg-yellow-500 px-2 py-1 rounded text-sm text-white cursor-pointer font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="bg-red-600 px-2 py-1 rounded text-sm text-white cursor-pointer font-semibold"
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

        {/* Add Doctor Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 rounded"
                />
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="Specialization"
                  className="border p-2 rounded"
                />
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  placeholder="Gender"
                  className="border p-2 rounded"
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="border p-2 rounded"
                />
                <input
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  placeholder="Availability (e.g. Mon-Fri, 9AM-5PM)"
                  className="border p-2 rounded"
                />
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Experience (years)"
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded border border-gray-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded bg-[#5AB32E] text-white font-semibold cursor-pointer"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
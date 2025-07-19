import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Doctor } from '../../types';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar,
  Filter,
  Stethoscope
} from 'lucide-react';

export const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          user:users(*)
        `)
        .eq('status', 'approved');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || doctor.location === selectedLocation;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
  const locations = [...new Set(doctors.map(doctor => doctor.location))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Find Your Doctor</h1>
        <p className="text-lg text-gray-600">
          Browse through our network of qualified healthcare professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('');
              setSelectedLocation('');
            }}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {doctor.user?.full_name}
                  </h3>
                  <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {doctor.location}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{doctor.experience_years} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Qualification:</span>
                  <span className="font-medium">{doctor.qualification}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-medium text-green-600">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {doctor.consultation_fee}
                  </span>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              <Link
                to={`/book-appointment/${doctor.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
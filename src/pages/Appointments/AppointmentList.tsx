import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

export const AppointmentList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(
            *,
            user:users(*)
          ),
          patient:users(*)
        `);

      // Filter based on user role
      if (user.role === 'patient') {
        query = query.eq('patient_id', user.id);
      } else if (user.role === 'doctor') {
        // Get doctor record first
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (doctorData) {
          query = query.eq('doctor_id', doctorData.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    filter === 'all' || appointment.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'doctor' ? 'Patient Appointments' : 'My Appointments'}
        </h1>
        
        {/* Filter Tabs */}
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You don't have any appointments yet." 
              : `No ${filter} appointments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-6">
                  {/* Doctor/Patient Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {user?.role === 'doctor' ? (
                        <User className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user?.role === 'doctor' 
                          ? appointment.patient?.full_name
                          : `Dr. ${appointment.doctor?.user?.full_name}`}
                      </h3>
                      {user?.role === 'patient' && (
                        <>
                          <p className="text-blue-600 text-sm">{appointment.doctor?.specialty}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {appointment.doctor?.location}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.appointment_time}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 lg:mt-0 flex space-x-2">
                  {user?.role === 'doctor' && appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {user?.role === 'doctor' && appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}

                  {user?.role === 'patient' && appointment.status === 'pending' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes: </span>
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
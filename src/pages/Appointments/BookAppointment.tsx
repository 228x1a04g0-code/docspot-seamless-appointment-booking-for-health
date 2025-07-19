import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Doctor } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Stethoscope,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { format, addDays, isWeekend } from 'date-fns';

const bookingSchema = z.object({
  appointment_date: z.string().min(1, 'Please select a date'),
  appointment_time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', doctorId)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user || !doctor) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            doctor_id: doctor.id,
            appointment_date: data.appointment_date,
            appointment_time: data.appointment_time,
            notes: data.notes,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      alert('Appointment booked successfully! You will receive a confirmation once the doctor approves it.');
      navigate('/appointments');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(error.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(currentDate, i);
      if (!isWeekend(date)) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor not found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="text-blue-600 hover:text-blue-500"
        >
          Back to doctors list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/doctors')}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Dr. {doctor.user?.full_name}
              </h2>
              <p className="text-blue-600 font-medium">{doctor.specialty}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <span>Consultation Fee: ${doctor.consultation_fee}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Experience: </span>
                <span className="font-medium">{doctor.experience_years} years</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Qualification: </span>
                <span className="font-medium">{doctor.qualification}</span>
              </div>
            </div>

            {doctor.bio && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600">{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Select Date & Time
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Date *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {getAvailableDates().slice(0, 15).map((date) => (
                    <label key={date.toISOString()} className="cursor-pointer">
                      <input
                        {...register('appointment_date')}
                        type="radio"
                        value={format(date, 'yyyy-MM-dd')}
                        className="sr-only"
                      />
                      <div className="p-3 text-center border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <div className="text-xs text-gray-500">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-sm font-medium">
                          {format(date, 'MMM d')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.appointment_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Time *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((time) => (
                    <label key={time} className="cursor-pointer">
                      <input
                        {...register('appointment_time')}
                        type="radio"
                        value={time}
                        className="sr-only"
                      />
                      <div className="p-2 text-center border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <div className="text-sm font-medium">{time}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.appointment_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointment_time.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any specific concerns or requirements..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    'Booking Appointment...'
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Book Appointment
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Booking Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Booking Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your appointment request will be sent to the doctor for approval</li>
                <li>• You'll receive a confirmation once the doctor accepts your request</li>
                <li>• Consultation fee will be collected during your visit</li>
                <li>• You can cancel or reschedule from your appointments page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
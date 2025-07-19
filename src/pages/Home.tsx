import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Star, 
  CheckCircle,
  ArrowRight,
  Stethoscope
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments with just a few clicks. No more waiting on hold or phone tag.',
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See available slots instantly and choose times that work for your schedule.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health information is protected with enterprise-grade security.',
    },
    {
      icon: Users,
      title: 'Qualified Doctors',
      description: 'Connect with verified healthcare professionals across various specialties.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Verified Doctors' },
    { number: '10,000+', label: 'Happy Patients' },
    { number: '50+', label: 'Specialties' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            DocSpot: Seamless Appointment
            <span className="text-blue-600"> Booking for Health</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Booking a doctor's appointment has never been easier. Schedule your appointments 
            from the comfort of your own home with our user-friendly platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              to="/doctors"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Find Doctors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose DocSpot?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our advanced booking system offers real-time availability and eliminates 
            the hassle of traditional appointment booking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in just a few simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">1. Sign Up</h3>
            <p className="text-gray-600">
              Create your account and complete your profile in minutes
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">2. Find Doctors</h3>
            <p className="text-gray-600">
              Browse and filter doctors by specialty, location, and availability
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">3. Book Appointment</h3>
            <p className="text-gray-600">
              Select your preferred time slot and confirm your appointment
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of patients who trust DocSpot for their healthcare needs
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </section>
      )}
    </div>
  );
};
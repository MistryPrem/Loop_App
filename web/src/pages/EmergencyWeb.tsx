import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

export const EmergencyWeb: React.FC = () => {
  const emergencyData = {
    patientName: 'Eleanor Vance',
    primaryContact: {
      name: 'Sarah Vance (Daughter / Caregiver)',
      phone: '+1 (555) 234-5678'
    },
    doctor: {
      name: 'Dr. Michael Chen (Cardiologist)',
      phone: '+1 (555) 876-5432'
    },
    hospital: 'Memorial General Hospital (Room 4B / Cardiac Clinic)',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    bloodType: 'O Positive',
    notes: 'Pacemaker implanted in 2023. Carries nitroglycerin.'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="border-b border-rose-200 dark:border-rose-900 pb-4">
        <h1 className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8" aria-hidden="true" />
          <span>Emergency Medical Info</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
          Patient: {emergencyData.patientName}
        </p>
      </header>

      <section aria-labelledby="caregiver-heading" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="caregiver-heading" className="text-sm font-bold tracking-wider text-teal-600 uppercase">
          Primary Caregiver
        </h2>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {emergencyData.primaryContact.name}
        </p>
        <a
          href={`tel:${emergencyData.primaryContact.phone}`}
          className="mt-4 inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-4 rounded-xl min-h-[48px] text-lg focus:ring-4 focus:ring-rose-300"
        >
          <Phone className="w-6 h-6" aria-hidden="true" />
          <span>Call {emergencyData.primaryContact.phone}</span>
        </a>
      </section>

      <section aria-labelledby="doctor-heading" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="doctor-heading" className="text-sm font-bold tracking-wider text-teal-600 uppercase">
          Cardiologist & Physician
        </h2>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {emergencyData.doctor.name}
        </p>
        <a
          href={`tel:${emergencyData.doctor.phone}`}
          className="mt-4 inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-4 rounded-xl min-h-[48px] text-lg focus:ring-4 focus:ring-teal-300"
        >
          <Phone className="w-6 h-6" aria-hidden="true" />
          <span>Call Doctor {emergencyData.doctor.phone}</span>
        </a>
      </section>

      <section aria-labelledby="medical-heading" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 id="medical-heading" className="text-xl font-bold text-slate-900 dark:text-white">
          Allergies & Critical Notes
        </h2>
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl">
          <p className="font-extrabold text-rose-800 dark:text-rose-200 text-lg">
            Allergies: {emergencyData.allergies.join(', ')}
          </p>
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          <strong>Blood Type:</strong> {emergencyData.bloodType}
        </p>
        <p className="text-lg text-slate-700 dark:text-slate-300">
          <strong>Notes:</strong> {emergencyData.notes}
        </p>
      </section>
    </div>
  );
};

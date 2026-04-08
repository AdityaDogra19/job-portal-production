import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

export default function Layout({ children }) {
  // Define layout structure with white/slate background
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 pt-8">
        {children}
      </main>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-white text-slate-900 shadow-xl rounded-xl border border-slate-100',
          duration: 4000,
          style: { padding: '16px', fontWeight: 500 }
        }} 
      />
    </div>
  );
}

import { useNavigate, Link } from 'react-router-dom';
import { WayzzaLayout } from '../../WayzzaUI.jsx';
import { Map, ArrowLeft, Home, Compass } from 'lucide-react';
import SEO from '../../components/SEO.jsx';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <WayzzaLayout>
      <SEO
        title="Page Not Found"
        description="This page could not be found. Return to Wayzza to discover luxury clifftop villas and Royal Enfield rentals in Varkala, Kerala."
        noindex={true}
        url="https://wayzza.live/"
      />
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center max-w-lg mx-auto space-y-8">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Map size={48} className="text-emerald-500" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <Compass size={24} className="text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Page Not Found</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Oops! It looks like we can't find the page you're looking for. The link might be
              broken or the page may have been moved.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-8 h-14 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
            >
              <ArrowLeft size={18} /> Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-10 h-14 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <Home size={18} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </WayzzaLayout>
  );
}

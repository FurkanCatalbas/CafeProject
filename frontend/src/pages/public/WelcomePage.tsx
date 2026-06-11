import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, Music, Coffee, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { placesService, PlaceDto } from '../../services/placesService';
import { musicService, MusicSessionDto } from '../../services/musicService';
import { setPlace as setStorePlace } from '../../store/slices/cartSlice';

const WelcomePage: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [musicSession, setMusicSession] = useState<MusicSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (qrCode) {
      fetchInitialData();
    }
  }, [qrCode]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Masayı bul (Public endpoint ile)
      const placeData = await placesService.getPublicByQr(qrCode!);
      setPlace(placeData);
      
      if (placeData.id) {
        dispatch(setStorePlace({ id: placeData.id, name: placeData.name }));
      }

      // 2. Müzik oylama oturumunu bul (Public endpoint ile)
      try {
        const sessionData = await musicService.getPublicSessionByPlaceId(placeData.id!);
        setMusicSession(sessionData);
      } catch (err) {
        console.warn('O an müzik oylaması aktif değil:', err);
      }

    } catch (err: any) {
      console.error('Veri çekme hatası:', err);
      setError('Masa bilgileri alınamadı. QR kod geçersiz veya sistem kapalı olabilir.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="font-bold text-slate-600 tracking-tight text-lg">Dijital Kafe Hazırlanıyor...</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Hata!</h1>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">{error || 'Beklenmedik bir hata oluştu.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Animated Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 rotate-6 hover:rotate-0 transition-transform duration-500">
            <Coffee className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Welcome Content */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">{place.name}</h1>
          <p className="text-slate-500 font-medium text-lg italic">Dijital Dünyamıza Hoş Geldiniz!</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Masa Servisiniz Hazır</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-4 mt-10">
          <button
            onClick={() => navigate(`/menu?table=${place.name}`)}
            className="group relative bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all text-left active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <Utensils className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Dijital Menü</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Zengin içerikli ürünlerimizi inceleyin.</p>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => navigate(`/music-vote/${musicSession?.qrCode || ''}`)}
            disabled={!musicSession}
            className={`group relative bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm transition-all text-left active:scale-[0.98]
              ${!musicSession ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-green-500 hover:shadow-xl'}
            `}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <Music className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Kafenin Ritmi</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {musicSession ? 'Çalacak şarkıyı siz seçin, oylamaya katılın.' : 'Müzik oylaması şu an aktif değil.'}
                </p>
              </div>
              {musicSession && <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />}
            </div>
          </button>
        </div>

        {/* Branding */}
        <div className="pt-12 space-y-2 opacity-50">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Powered by Cafe System
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;

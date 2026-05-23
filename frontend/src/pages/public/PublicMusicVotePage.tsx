import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { musicService, VoteRoundDto } from '../../services/musicService';
import { Music, CheckCircle2, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';

const PublicMusicVotePage: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
    // Her 5 saniyede bir oylama durumunu güncelle
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [qrCode]);

  const fetchSession = async () => {
    if (!qrCode) return;
    try {
      const data = await musicService.getPublicSession(qrCode);
      setSession(data);
      setError(null);
    } catch (err: any) {
      console.error('Oylama oturumu çekme hatası:', err);
      if (loading) setError('Oylama şu an aktif değil veya mekan kapalı.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (trackId: number) => {
    if (!qrCode || !session?.currentRound || voted) return;
    try {
      setVoting(true);
      await musicService.vote(qrCode, session.currentRound.id, trackId);
      setVoted(true);
      await fetchSession();
    } catch (err: any) {
      if (err.response?.data?.duplicate || err.response?.data?.message?.includes('duplicate')) {
        setVoted(true);
      } else {
        alert('Oy verme işlemi başarısız oldu.');
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="font-bold tracking-tight">Müzik Odasına Bağlanılıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2 tracking-tight">Eyvah!</h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-white text-black px-10 py-3.5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-colors">Tekrar Dene</button>
      </div>
    );
  }

  const round: VoteRoundDto = session?.currentRound;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 font-sans selection:bg-blue-500">
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col items-center mb-12 mt-8 relative z-10">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] mb-6 animate-pulse">
          <Music className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">KAFE RADYO</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">Sıradaki şarkıyı sen belirle</p>
      </div>

      {round ? (
        <div className="max-w-md mx-auto space-y-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 rounded-full mb-4">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Oylama Canlı</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Hangi Şarkı Çalsın?</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[round.leftTrack, round.rightTrack].map((track, idx) => {
              if (!track) return null;
              const isLeft = idx === 0;
              const votes = isLeft ? round.leftVotes : round.rightVotes;
              const total = round.leftVotes + round.rightVotes || 1;
              const percent = Math.round((votes / total) * 100);

              return (
                <button
                  key={track.id}
                  onClick={() => handleVote(track.id)}
                  disabled={voting || voted}
                  className={`relative group overflow-hidden bg-slate-900/50 backdrop-blur-sm border-2 rounded-[2rem] p-5 transition-all duration-500
                    ${voted ? 'cursor-default' : 'active:scale-95 hover:border-blue-500/50 hover:bg-slate-900'}
                    ${voted && isLeft ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'}
                  `}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="relative flex-shrink-0">
                      <img src={track.imageUrl} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-2xl group-hover:rotate-3 transition-transform" />
                      {voted && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0 py-1">
                      <p className="font-black text-xl leading-tight truncate mb-1">{track.name}</p>
                      <p className="text-slate-500 text-sm font-semibold truncate">{track.artistName}</p>
                      
                      {voted && (
                        <div className="mt-4 flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                                style={{ width: `${percent}%` }}
                              />
                           </div>
                           <span className="text-blue-500 font-black text-sm tabular-nums tracking-tighter">%{percent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {voted && (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                 <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-blue-100 leading-relaxed">
                Tebrikler! Oyun kaydedildi. Kazanan şarkı oylama bittiğinde kafede yankılanacak.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-md mx-auto py-24 text-center space-y-6 relative z-10">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 shadow-inner">
            <RefreshCw className="h-10 w-10 text-slate-700 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Oylama Bekleniyor</h3>
            <p className="text-slate-500 mt-2 font-medium">Kafede yeni bir oylama turu başladığında seçenekler anında burada belirecek.</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-20">
        <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl rounded-[2rem] p-4 border border-white/10 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Şu An Oylanan</p>
                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                  {round ? `${round.leftTrack.name} vs ${round.rightTrack.name}` : 'Sıradaki Şarkı'}
                </p>
             </div>
           </div>
           <div className="bg-white/10 px-4 py-2 rounded-2xl">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Oda: {session?.playlistName || 'Global'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMusicVotePage;

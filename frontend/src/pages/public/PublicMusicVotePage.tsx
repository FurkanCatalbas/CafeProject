import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { musicService, VoteRoundDto } from '../../services/musicService';
import { Music, CheckCircle2, RefreshCw, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

const PublicMusicVotePage: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (isInitial = false) => {
    if (!qrCode) return;
    if (isInitial) setLoading(true);
    try {
      const data = await musicService.getPublicSession(qrCode);
      
      // Eğer round değişmişse 'voted' durumunu sıfırla
      if (session?.currentRound?.id !== data.currentRound?.id) {
        setVoted(false);
      }
      
      setSession(data);
      setError(null);
    } catch (err: any) {
      console.error('Oylama oturumu çekme hatası:', err);
      if (isInitial) setError('Oylama şu an aktif değil veya mekan kapalı.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [qrCode, session?.currentRound?.id]);

  useEffect(() => {
    fetchSession(true);
    const interval = setInterval(() => fetchSession(false), 4000);
    return () => clearInterval(interval);
  }, [qrCode, fetchSession]);

  const handleVote = async (trackId: number) => {
    if (!qrCode || !session?.currentRound || voted || voting) return;
    try {
      setVoting(true);
      await musicService.vote(qrCode, session.currentRound.id, trackId);
      setVoted(true);
      // Oyu hemen yansıtmak için session'ı manuel güncelle (opsiyonel)
      await fetchSession(false);
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse"></div>
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin relative z-10" />
        </div>
        <p className="mt-6 font-black tracking-widest uppercase text-xs text-slate-400">Müzik Odasına Bağlanılıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tighter uppercase">OYLAMA KAPALI</h1>
        <p className="text-slate-400 mb-10 max-w-xs mx-auto leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full max-w-xs bg-white text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest active:scale-95 transition-transform shadow-xl shadow-white/5">Tekrar Dene</button>
      </div>
    );
  }

  const round: VoteRoundDto = session?.currentRound;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 overflow-x-hidden">
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 p-6 pb-32">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 mt-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-6 animate-pulse">
            <Music className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">KAFE <span className="text-blue-500">RADYO</span></h1>
          <p className="text-slate-500 text-[10px] mt-3 font-black uppercase tracking-[0.3em]">Sıradaki şarkıyı sen seç</p>
        </div>

        {round && round.status === 'ACTIVE' ? (
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-5 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Oylama Canlı</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight leading-tight px-4">ŞİMDİ OYUNU KULLAN, ATMOSFERİ DEĞİŞTİR!</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                    className={`relative group overflow-hidden bg-white/5 backdrop-blur-md border-2 rounded-[2.5rem] p-6 transition-all duration-500 active:scale-95
                      ${voted ? 'cursor-default' : 'hover:border-blue-500/50'}
                      ${voted && track.id === track.id ? 'border-white/10' : 'border-white/5'}
                      ${voted && isLeft ? 'bg-blue-600/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="relative flex-shrink-0">
                        {track.imageUrl ? (
                          <img src={track.imageUrl} alt="" className="w-24 h-24 rounded-3xl object-cover shadow-2xl transition-transform" />
                        ) : (
                          <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/10">
                            <Music className="h-8 w-8 text-slate-600" />
                          </div>
                        )}
                        {voted && (
                          <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-2xl shadow-xl border-2 border-slate-950 animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-black text-xl leading-tight truncate mb-1">{track.name}</p>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter truncate">{track.artistName}</p>
                        
                        {voted && (
                          <div className="mt-4 space-y-2">
                             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                  style={{ width: `${percent}%` }}
                                />
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-blue-500 font-black text-xs uppercase tracking-widest">%{percent}</span>
                               <span className="text-slate-600 text-[10px] font-bold uppercase">{votes} OY</span>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {voted && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-6 flex items-center gap-5 shadow-2xl shadow-blue-900/20 border border-blue-400/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                   <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight uppercase mb-1">Oyun Kaydedildi!</p>
                  <p className="text-xs font-medium text-blue-100 leading-relaxed">
                    Harika bir seçim! Kazanan şarkı oylama bittiğinde tüm kafede çalmaya başlayacak.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-28 h-28 bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto border border-white/10 shadow-inner relative">
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full"></div>
              <RefreshCw className="h-12 w-12 text-slate-700 animate-spin-slow relative z-10" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-3">Sıradaki Tur Bekleniyor</h3>
              <p className="text-slate-500 font-medium max-w-[240px] mx-auto text-sm leading-relaxed">
                Yöneticilerimiz şu an yeni şarkıları hazırlıyor. Birkaç saniye içinde burada belirecekler!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Info Footer */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-20">
        <div className="max-w-md mx-auto bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-5 border border-white/10 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-4 min-w-0">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5">
                <TrendingUp className="h-6 w-6 text-blue-500" />
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Şu An Oylanan</p>
                <p className="text-sm font-bold text-white truncate pr-4 uppercase tracking-tighter">
                  {round && round.status === 'ACTIVE' ? `${round.leftTrack?.name} vs ${round.rightTrack?.name}` : 'Tur Bekleniyor...'}
                </p>
             </div>
           </div>
           <div className="bg-blue-600/20 px-4 py-2.5 rounded-2xl flex-shrink-0 border border-blue-500/20">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter whitespace-nowrap">{session?.playlistName || 'Kafe Radyo'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMusicVotePage;

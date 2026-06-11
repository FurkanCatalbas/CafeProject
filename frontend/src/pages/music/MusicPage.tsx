import React, { useEffect, useState, useCallback } from 'react';
import { 
  musicService, 
  SpotifyConnectionStatusDto, 
  SpotifyPlaylistDto, 
  MusicSessionDto,
  TrackDto,
  VoteRoundDto
} from '../../services/musicService';
import { 
  Music, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ListMusic, 
  PlayCircle,
  QrCode,
  Trophy,
  RefreshCw,
  Plus,
  Users,
  Settings,
  XCircle
} from 'lucide-react';

const MusicPage: React.FC = () => {
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatusDto | null>(null);
  const [session, setSession] = useState<MusicSessionDto | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylistDto[]>([]);
  const [tracks, setTracks] = useState<TrackDto[]>([]);
  const [currentRound, setCurrentRound] = useState<VoteRoundDto | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeId = 1; // Sabit mekan id

  const loadInitialData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const status = await musicService.getSpotifyStatus(placeId);
      setSpotifyStatus(status);

      const sessionData = await musicService.getOrCreateSession(placeId);
      setSession(sessionData);

      if (status.connected) {
        // Paralel yükleme
        const [plData, roundData] = await Promise.all([
          musicService.getPlaylists(placeId).catch(() => []),
          musicService.getCurrentRound(placeId).catch(() => null)
        ]);
        
        setPlaylists(plData);
        setCurrentRound(roundData);

        if (sessionData.selectedPlaylistId) {
          const trackData = await musicService.getTracks(placeId).catch(() => []);
          setTracks(trackData);
        }
      }
    } catch (err: any) {
      console.error('Veri yükleme hatası:', err);
      setError('Sistem verileri yüklenemedi. Servislerin açık olduğundan emin olun.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Canlı Oylama Takibi (Polling)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session?.selectedPlaylistId && currentRound && currentRound.status === 'ACTIVE') {
      interval = setInterval(() => {
        musicService.getCurrentRound(placeId)
          .then(data => {
            if (!data) setCurrentRound(null);
            else setCurrentRound(data);
          })
          .catch(() => {
            // Sessizce devam et veya oylama bittiyse temizle
          });
      }, 4000); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, currentRound, placeId]);

  const handleConnectSpotify = async () => {
    try {
      const response = await musicService.getSpotifyAuthorizeUrl(placeId);
      if (response.authorizeUrl || response.authorizationUrl) {
        window.location.href = (response.authorizeUrl || response.authorizationUrl) as string;
      }
    } catch (err) {
      alert('Spotify bağlantısı başlatılamadı.');
    }
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setActionLoading(true);
    try {
      const updatedSession = await musicService.selectPlaylist(placeId, playlistId);
      setSession(updatedSession);
      setCurrentRound(null); // Playlist değişince oylama düşmeli
      const trackData = await musicService.getTracks(placeId);
      setTracks(trackData);
      alert('Playlist başarıyla seçildi.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Playlist seçilemedi. Backend loglarını kontrol edin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRound = async () => {
    setActionLoading(true);
    try {
      const round = await musicService.startNextRound(placeId);
      setCurrentRound(round);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Oylama başlatılamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseRound = async () => {
    setActionLoading(true);
    try {
      const closedRound = await musicService.closeRound(placeId);
      setCurrentRound(null);
      alert(`Oylama bitti! Kazanan şarkı Spotify'da başlatıldı.`);
      await loadInitialData(true);
    } catch (err: any) {
      // Eğer backend'de oylama zaten yoksa, frontend'i de temizle
      if (err.response?.status === 404 || err.response?.data?.message?.includes('bulunamadi')) {
        setCurrentRound(null);
      }
      alert(err.response?.data?.message || 'Oylama kapatılamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-screen bg-slate-50">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Müzik Odası Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Music className="h-8 w-8 text-blue-600" />
            Müzik Yönetimi
          </h1>
          <p className="text-slate-500 text-sm font-medium">Mekanın atmosferini ve oylamaları kontrol et.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => loadInitialData()} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
            title="Verileri Yenile"
          >
            <RefreshCw className={`h-5 w-5 ${actionLoading ? 'animate-spin' : ''}`} />
          </button>
          {session?.publicVotingUrl && (
            <div className="flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200">
              <QrCode className="h-5 w-5" />
              <span className="text-sm font-bold tracking-widest uppercase">{session.qrCode}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Panel: Spotify ve Playlistler */}
        <div className="lg:col-span-4 space-y-6">
          {/* Spotify Connection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Settings className="h-4 w-4 text-slate-400" />
                Spotify Durumu
              </h3>
              {spotifyStatus?.connected ? (
                <span className="flex items-center gap-1.5 text-[10px] bg-green-500 text-white px-2.5 py-1 rounded-full font-black uppercase">
                  AKTİF
                </span>
              ) : (
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-black uppercase">
                  KAPALI
                </span>
              )}
            </div>
            <div className="p-6 text-center">
              {spotifyStatus?.connected ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-blue-600 border-4 border-white shadow-md">
                    <span className="text-2xl font-black">{spotifyStatus.spotifyDisplayName?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{spotifyStatus.spotifyDisplayName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Bağlı Hesap</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 leading-relaxed">Oylama sistemini başlatmak için Spotify hesabınızı bağlayın.</p>
                  <button
                    onClick={handleConnectSpotify}
                    className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100"
                  >
                    Hemen Bağlan <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Selector */}
          {spotifyStatus?.connected && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <ListMusic className="h-4 w-4 text-slate-400" />
                  Playlist Seçimi
                </h3>
              </div>
              <div className="p-3 overflow-y-auto space-y-2">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl.id)}
                    disabled={actionLoading}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-4 group relative border-2
                      ${session?.selectedPlaylistId === pl.id 
                        ? 'bg-blue-50 border-blue-500 shadow-sm' 
                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      {pl.imageUrl ? (
                        <img src={pl.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                      {session?.selectedPlaylistId === pl.id && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 border-2 border-white shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold truncate text-sm ${session?.selectedPlaylistId === pl.id ? 'text-blue-700' : 'text-slate-800'}`}>
                        {pl.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{pl.trackCount} Şarkı</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ana Panel: Oylama Kontrolü ve Şarkı Listesi */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Voting Round Section */}
          {session?.selectedPlaylistId ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    Canlı Oylama Paneli
                  </h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-widest">
                    LİSTE: {session.playlistName}
                  </p>
                </div>
                {(!currentRound || currentRound.status !== 'ACTIVE') && (
                  <button
                    onClick={handleStartRound}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-100 flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="h-5 w-5" /> OYLAMAYI BAŞLAT
                  </button>
                )}
              </div>
              
              <div className="p-8">
                {currentRound && currentRound.status === 'ACTIVE' ? (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-blue-100">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">TUR #{currentRound.roundNumber} CANLI</span>
                      </div>
                      <button 
                        onClick={handleCloseRound}
                        disabled={actionLoading}
                        className="text-xs font-black text-red-600 hover:bg-red-50 px-5 py-2 rounded-xl uppercase border-2 border-red-100 transition-all flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" /> Oylamayı Bitir
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-around gap-12 py-4">
                      {/* Şarkı A */}
                      <TrackPreviewCard 
                        track={currentRound.leftTrack} 
                        votes={currentRound.leftVotes} 
                        total={currentRound.leftVotes + currentRound.rightVotes} 
                      />

                      <div className="relative">
                        <div className="text-4xl font-black text-slate-100 italic select-none">VS</div>
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
                      </div>

                      {/* Şarkı B */}
                      <TrackPreviewCard 
                        track={currentRound.rightTrack} 
                        votes={currentRound.rightVotes} 
                        total={currentRound.leftVotes + currentRound.rightVotes} 
                      />
                    </div>

                    {/* Stats Footer */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                          <Users className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Toplam Katılım</p>
                          <p className="text-3xl font-black tracking-tight">{currentRound.leftVotes + currentRound.rightVotes} <span className="text-sm font-medium text-slate-500 uppercase ml-1">Oy</span></p>
                        </div>
                      </div>
                      <div className="text-center md:text-right space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Oylama Bağlantısı</p>
                        <a href={session.publicVotingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-all shadow-lg">
                          Müşteri Ekranını Gör <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-slate-100">
                      <PlayCircle className="h-12 w-12 text-slate-200" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">Sıradaki Oylamayı Başlatın</h4>
                      <p className="text-sm text-slate-400 max-w-sm mt-2 font-medium">
                        Playlistiniz hazır. Hemen bir oylama başlatarak müşterilerinizin sıradaki şarkıyı seçmesini sağlayın.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <ListMusic className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Önce Playlist Seçin</h3>
            </div>
          )}

          {/* Playlist Content Table */}
          {tracks.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Music className="h-4 w-4 text-slate-400" />
                  Playlist İçeriği
                  <span className="text-[10px] font-black text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
                    {tracks.length} PARÇA
                  </span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4">#</th>
                      <th className="px-4 py-4">Şarkı & Sanatçı</th>
                      <th className="px-8 py-4 text-right">Sıra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tracks.map((track, idx) => (
                      <tr key={track.spotifyTrackId || idx} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-5 text-slate-300 font-black tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-4">
                            {track.imageUrl ? (
                              <img src={track.imageUrl} alt="" className="w-10 h-10 rounded-lg shadow-sm" />
                            ) : (
                               <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Music className="h-4 w-4 text-slate-300" /></div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate leading-tight">{track.name}</p>
                              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 uppercase tracking-tighter">{track.artistName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Music className="h-3 w-3 text-slate-200 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Track Preview Component
const TrackPreviewCard = ({ track, votes, total }: { track: any, votes: number, total: number }) => {
  if (!track) return (
    <div className="w-48 h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 animate-pulse"></div>
  );

  const percent = Math.round((votes / (total || 1)) * 100);

  return (
    <div className="flex flex-col items-center text-center space-y-5 group">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
        {track.imageUrl ? (
          <img src={track.imageUrl} alt="" className="w-40 h-40 rounded-[2.5rem] shadow-2xl border-4 border-white relative z-10 group-hover:rotate-3 transition-transform" />
        ) : (
          <div className="w-40 h-40 bg-slate-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white relative z-10 shadow-lg">
             <Music className="h-16 w-16 text-slate-200" />
          </div>
        )}
        <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl shadow-xl px-4 py-1.5 border border-slate-100 z-20">
          <span className="text-lg font-black text-blue-600 tabular-nums">%{percent}</span>
        </div>
      </div>
      <div className="min-w-0 max-w-[180px]">
        <p className="font-black text-slate-900 text-lg truncate leading-tight">{track.name}</p>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter truncate mt-1">{track.artistName}</p>
      </div>
    </div>
  );
};

export default MusicPage;

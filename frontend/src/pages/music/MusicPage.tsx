import React, { useEffect, useState } from 'react';
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
  Plus
} from 'lucide-react';

const MusicPage: React.FC = () => {
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatusDto | null>(null);
  const [session, setSession] = useState<MusicSessionDto | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylistDto[]>([]);
  const [tracks, setTracks] = useState<TrackDto[]>([]);
  const [currentRound, setCurrentRound] = useState<VoteRoundDto | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const placeId = 1; // Sabit mekan id

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const status = await musicService.getSpotifyStatus(placeId);
      setSpotifyStatus(status);

      const sessionData = await musicService.getOrCreateSession(placeId);
      setSession(sessionData);

      if (status.connected) {
        await Promise.all([
          fetchPlaylists(),
          sessionData.selectedPlaylistId ? fetchTracks() : Promise.resolve(),
          fetchCurrentRound()
        ]);
      }
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await musicService.getPlaylists(placeId);
      setPlaylists(data);
    } catch (err) {
      console.error('Playlist çekme hatası:', err);
    }
  };

  const fetchTracks = async () => {
    try {
      const data = await musicService.getTracks(placeId);
      setTracks(data);
    } catch (err) {
      console.error('Şarkı çekme hatası:', err);
    }
  };

  const fetchCurrentRound = async () => {
    try {
      const data = await musicService.getCurrentRound(placeId);
      setCurrentRound(data);
    } catch (err) {
      console.error('Round çekme hatası:', err);
    }
  };

  const handleConnectSpotify = async () => {
    try {
      const response = await musicService.getSpotifyAuthorizeUrl(placeId);
      if (response.authorizeUrl || response.authorizationUrl) {
        window.location.href = (response.authorizeUrl || response.authorizationUrl) as string;
      }
    } catch (err) {
      console.error('Spotify yetkilendirme hatası:', err);
    }
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setActionLoading(true);
    try {
      const updatedSession = await musicService.selectPlaylist(placeId, playlistId);
      setSession(updatedSession);
      await fetchTracks();
      alert('Playlist başarıyla seçildi ve şarkılar aktarıldı.');
    } catch (err: any) {
      console.error('Playlist seçme hatası:', err);
      alert(err.response?.data?.message || 'Playlist seçilemedi. En az 2 saniye bekleyip tekrar deneyin veya farklı bir liste seçin.');
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
      console.error('Round başlatma hatası:', err);
      alert(err.response?.data?.message || 'Oylama başlatılamadı. Playlistin yeterli şarkı içerdiğinden emin olun.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseRound = async () => {
    setActionLoading(true);
    try {
      const closedRound = await musicService.closeRound(placeId);
      setCurrentRound(null);
      alert(`Oylama bitti! Kazanan: ${closedRound.winnerTrack?.name}`);
    } catch (err: any) {
      console.error('Round kapatma hatası:', err);
      alert(err.response?.data?.message || 'Oylama kapatılamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Müzik Yönetimi</h1>
          <p className="text-slate-500 text-sm">Spotify entegrasyonu ve şarkı oylama sistemi.</p>
        </div>
        {session?.publicVotingUrl && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
            <QrCode className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">{session.qrCode}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Durum ve Playlist Seçimi */}
        <div className="lg:col-span-1 space-y-6">
          {/* Spotify Durumu */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Music className="h-4 w-4 text-green-500" />
                Spotify
              </h3>
              {spotifyStatus?.connected ? (
                <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 uppercase font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Bağlı
                </span>
              ) : (
                <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 uppercase font-bold">
                  Bağlı Değil
                </span>
              )}
            </div>
            <div className="p-5 text-sm">
              {spotifyStatus?.connected ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    {spotifyStatus.spotifyDisplayName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{spotifyStatus.spotifyDisplayName}</p>
                    <p className="text-xs text-slate-500">Premium Hesap Aktif</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-500 mb-4">Müzik sistemini başlatmak için Spotify hesabınızı bağlamanız gerekiyor.</p>
                  <button
                    onClick={handleConnectSpotify}
                    className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                  >
                    Spotify'a Bağlan <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Playlistler */}
          {spotifyStatus?.connected && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <ListMusic className="h-4 w-4 text-blue-600" />
                  Playlist Seçin
                </h3>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {playlists.length > 0 ? (
                  <div className="space-y-1">
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => handleSelectPlaylist(pl.id)}
                        disabled={actionLoading}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-all flex items-center gap-3 group
                          ${session?.selectedPlaylistId === pl.id 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          {pl.imageUrl ? (
                            <img src={pl.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                              <Music className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          {session?.selectedPlaylistId === pl.id && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{pl.name}</p>
                          <p className="text-[10px] opacity-70 uppercase tracking-tighter">{pl.trackCount} Şarkı</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-center text-slate-500 text-xs italic">Playlist bulunamadı.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orta ve Sağ Kolon: Aktif Round ve Şarkı Listesi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aktif Oylama Paneli */}
          {session?.selectedPlaylistId && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    Oylama Kontrolü
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">Aktif Liste: {session.playlistName}</p>
                </div>
                {!currentRound && (
                  <button
                    onClick={handleStartRound}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Oylamayı Başlat
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {currentRound ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                        TUR #{currentRound.roundNumber} AKTİF
                      </span>
                      <button 
                        onClick={handleCloseRound}
                        disabled={actionLoading}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded-full uppercase border border-red-100 transition-colors"
                      >
                        Oylamayı Bitir
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                      {/* Şarkı A */}
                      <div className="flex flex-col items-center text-center space-y-3 max-w-[160px]">
                        <div className="relative group">
                          <img src={currentRound.leftTrack.imageUrl} alt="" className="w-32 h-32 rounded-xl shadow-lg border-2 border-slate-100" />
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-md px-2 py-1 border border-slate-200 text-xs font-bold text-blue-600">
                            %{Math.round((currentRound.leftVotes / (currentRound.leftVotes + currentRound.rightVotes || 1)) * 100)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate w-full">{currentRound.leftTrack.name}</p>
                          <p className="text-xs text-slate-500 truncate w-full">{currentRound.leftTrack.artistName}</p>
                        </div>
                      </div>

                      <div className="text-2xl font-black text-slate-200 italic">VS</div>

                      {/* Şarkı B */}
                      <div className="flex flex-col items-center text-center space-y-3 max-w-[160px]">
                        <div className="relative group">
                          <img src={currentRound.rightTrack.imageUrl} alt="" className="w-32 h-32 rounded-xl shadow-lg border-2 border-slate-100" />
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-md px-2 py-1 border border-slate-200 text-xs font-bold text-blue-600">
                            %{Math.round((currentRound.rightVotes / (currentRound.leftVotes + currentRound.rightVotes || 1)) * 100)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate w-full">{currentRound.rightTrack.name}</p>
                          <p className="text-xs text-slate-500 truncate w-full">{currentRound.rightTrack.artistName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <UsersIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Toplam Oy</p>
                          <p className="text-lg font-black text-blue-600">{currentRound.leftVotes + currentRound.rightVotes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Oylama Linki</p>
                        <a href={session.publicVotingUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center justify-end gap-1">
                          Kafe Ekranını Aç <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <PlayCircle className="h-8 w-8 text-slate-300" />
                    </div>
                    <h4 className="font-semibold text-slate-700">Oylama Hazır</h4>
                    <p className="text-sm text-slate-500 max-w-xs mt-1">
                      Müşterilerin oy verebilmesi için yukarıdaki butondan yeni bir oylama turu başlatın.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Şarkı Listesi */}
          {session?.selectedPlaylistId && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <ListMusic className="h-4 w-4 text-slate-400" />
                  Playlist İçeriği
                  <span className="text-xs font-normal text-slate-400 ml-1">({tracks.length} Şarkı)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-medium">#</th>
                      <th className="px-6 py-3 font-medium">Şarkı</th>
                      <th className="px-6 py-3 font-medium text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tracks.map((track, idx) => (
                      <tr key={track.spotifyTrackId} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {track.imageUrl && (
                              <img src={track.imageUrl} alt="" className="w-8 h-8 rounded shadow-sm" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{track.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{track.artistName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <Music className="h-3 w-3 text-slate-300 inline" />
                           </div>
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

// Basit bir ikon bileşeni (Lucide'da eksikse diye)
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default MusicPage;

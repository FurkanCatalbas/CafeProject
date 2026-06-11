import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface SpotifyAuthorizeResponse {
  authorizeUrl?: string;
  authorizationUrl?: string;
}

export interface SpotifyConnectionStatusDto {
  connected: boolean;
  spotifyDisplayName?: string;
  spotifyProfileImage?: string;
}

export interface SpotifyPlaylistDto {
  id: string;
  name: string;
  uri: string;
  trackCount: number;
  imageUrl?: string;
  externalUrl?: string;
}

export interface MusicSessionDto {
  placeId: number;
  selectedPlaylistId?: string;
  playlistName?: string;
  qrCode?: string;
  publicVotingUrl?: string;
  active: boolean;
}

export interface TrackDto {
  id: number;
  spotifyTrackId: string;
  name: string;
  artistName: string;
  imageUrl?: string;
  albumName?: string;
  playlistPosition?: number;
}

export interface VoteRoundDto {
  id: number;
  roundNumber: number;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  leftTrack: TrackDto;
  rightTrack: TrackDto;
  leftVotes: number;
  rightVotes: number;
  winnerTrack?: TrackDto;
}

export const musicService = {
  getSpotifyAuthorizeUrl: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/spotify/authorize`, {
      params: { placeId }
    });
    return unwrapApiData<SpotifyAuthorizeResponse>(response.data);
  },

  getSpotifyStatus: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/venues/${placeId}/spotify/status`);
    return unwrapApiData<SpotifyConnectionStatusDto>(response.data);
  },

  getPlaylists: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/venues/${placeId}/spotify/playlists`);
    return unwrapApiData<SpotifyPlaylistDto[]>(response.data);
  },

  getOrCreateSession: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/venues/${placeId}`);
    return unwrapApiData<MusicSessionDto>(response.data);
  },

  selectPlaylist: async (placeId: number, playlistId: string) => {
    const response = await api.post(`/music-service/api/music-votes/venues/${placeId}/playlist`, { playlistId });
    return unwrapApiData<MusicSessionDto>(response.data);
  },

  getTracks: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/venues/${placeId}/tracks`);
    return unwrapApiData<TrackDto[]>(response.data);
  },

  getCurrentRound: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/venues/${placeId}/rounds/current`);
    return unwrapApiData<VoteRoundDto>(response.data);
  },

  startNextRound: async (placeId: number) => {
    const response = await api.post(`/music-service/api/music-votes/venues/${placeId}/rounds/start`);
    return unwrapApiData<VoteRoundDto>(response.data);
  },

  closeRound: async (placeId: number, deviceId?: string) => {
    const response = await api.post(`/music-service/api/music-votes/venues/${placeId}/rounds/current/close`, { deviceId });
    return unwrapApiData<VoteRoundDto>(response.data);
  },

  // Public Methods (Müşteriler için login gerektirmeyenler)
  getPublicSession: async (qrCode: string) => {
    const response = await api.get(`/music-service/api/music-votes/public/${qrCode}`);
    return unwrapApiData<any>(response.data);
  },

  vote: async (qrCode: string, roundId: number, trackId: number) => {
    const response = await api.post(`/music-service/api/music-votes/public/${qrCode}/vote`, {
      roundId,
      trackId
    });
    return unwrapApiData<any>(response.data);
  },

  getPublicSessionByPlaceId: async (placeId: number) => {
    const response = await api.get(`/music-service/api/music-votes/public/venue/${placeId}`);
    return unwrapApiData<any>(response.data);
  }
};

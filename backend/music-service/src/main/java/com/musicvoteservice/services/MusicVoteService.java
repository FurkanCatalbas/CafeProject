package com.musicvoteservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.musicvoteservice.config.MusicVoteProperties;
import com.musicvoteservice.dtos.CloseRoundRequest;
import com.musicvoteservice.dtos.MusicSessionDto;
import com.musicvoteservice.dtos.PublicVoteSessionDto;
import com.musicvoteservice.dtos.SelectPlaylistRequest;
import com.musicvoteservice.dtos.SpotifyAuthorizeResponse;
import com.musicvoteservice.dtos.SpotifyConnectionStatusDto;
import com.musicvoteservice.dtos.SpotifyPlaylistDto;
import com.musicvoteservice.dtos.TrackDto;
import com.musicvoteservice.dtos.VoteRequest;
import com.musicvoteservice.dtos.VoteResultDto;
import com.musicvoteservice.dtos.VoteRoundDto;
import com.musicvoteservice.models.MusicTrackEntity;
import com.musicvoteservice.models.MusicVenueSessionEntity;
import com.musicvoteservice.models.SpotifyConnectionEntity;
import com.musicvoteservice.models.SpotifyOAuthStateEntity;
import com.musicvoteservice.models.VoteEntity;
import com.musicvoteservice.models.VoteRoundEntity;
import com.musicvoteservice.models.VoteRoundStatus;
import com.musicvoteservice.repositories.MusicTrackRepository;
import com.musicvoteservice.repositories.MusicVenueSessionRepository;
import com.musicvoteservice.repositories.SpotifyConnectionRepository;
import com.musicvoteservice.repositories.SpotifyOAuthStateRepository;
import com.musicvoteservice.repositories.VoteRepository;
import com.musicvoteservice.repositories.VoteRoundRepository;
import com.musicvoteservice.spotify.SpotifyClient;
import com.musicvoteservice.spotify.SpotifyTokenResponse;
import com.wise.core.enums.UserRole;
import com.wise.core.exceptions.BadRequestException;
import com.wise.core.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MusicVoteService {

    private final SpotifyClient spotifyClient;
    private final MusicVoteProperties musicVoteProperties;
    private final SpotifyOAuthStateRepository spotifyOAuthStateRepository;
    private final SpotifyConnectionRepository spotifyConnectionRepository;
    private final MusicVenueSessionRepository musicVenueSessionRepository;
    private final MusicTrackRepository musicTrackRepository;
    private final VoteRoundRepository voteRoundRepository;
    private final VoteRepository voteRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public SpotifyAuthorizeResponse createSpotifyAuthorization(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        if (placeId == null) {
            throw new BadRequestException("Mekan id zorunludur.");
        }

        getOrCreateSessionEntity(placeId, ownerUserId);

        String state = generateToken(24);
        SpotifyOAuthStateEntity stateEntity = new SpotifyOAuthStateEntity();
        stateEntity.setState(state);
        stateEntity.setOwnerUserId(ownerUserId);
        stateEntity.setPlaceId(placeId);
        stateEntity.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        stateEntity.setUsed(false);
        spotifyOAuthStateRepository.save(stateEntity);

        return new SpotifyAuthorizeResponse(spotifyClient.buildAuthorizeUrl(state), state);
    }

    @Transactional
    public SpotifyConnectionStatusDto handleSpotifyCallback(String code, String state) {
        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            throw new BadRequestException("Spotify callback parametreleri eksik.");
        }

        SpotifyOAuthStateEntity stateEntity = spotifyOAuthStateRepository.findByState(state)
                .orElseThrow(() -> new BadRequestException("Spotify state gecersiz."));

        if (Boolean.TRUE.equals(stateEntity.getUsed()) || stateEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Spotify state suresi doldu.");
        }

        SpotifyTokenResponse tokenResponse = spotifyClient.exchangeCode(code);
        JsonNode profile = spotifyClient.getCurrentUser(tokenResponse.getAccessToken());

        SpotifyConnectionEntity connection = spotifyConnectionRepository.findByPlaceId(stateEntity.getPlaceId())
                .orElseGet(SpotifyConnectionEntity::new);
        connection.setOwnerUserId(stateEntity.getOwnerUserId());
        connection.setPlaceId(stateEntity.getPlaceId());
        connection.setSpotifyUserId(text(profile.path("id")));
        connection.setDisplayName(text(profile.path("display_name")));
        connection.setAccessToken(tokenResponse.getAccessToken());
        connection.setRefreshToken(tokenResponse.getRefreshToken());
        connection.setTokenType(tokenResponse.getTokenType());
        connection.setScope(tokenResponse.getScope());
        connection.setTokenExpiresAt(LocalDateTime.now().plusSeconds(tokenResponse.getExpiresIn() == null ? 3600 : tokenResponse.getExpiresIn()));
        connection.setConnectedAt(LocalDateTime.now());
        connection = spotifyConnectionRepository.save(connection);

        stateEntity.setUsed(true);
        spotifyOAuthStateRepository.save(stateEntity);

        return toConnectionStatus(connection);
    }

    @Transactional(readOnly = true)
    public SpotifyConnectionStatusDto getSpotifyConnectionStatus(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        SpotifyConnectionStatusDto status = new SpotifyConnectionStatusDto();
        status.setPlaceId(placeId);
        spotifyConnectionRepository.findByPlaceId(placeId).ifPresent(connection -> {
            status.setConnected(true);
            status.setSpotifyUserId(connection.getSpotifyUserId());
            status.setDisplayName(connection.getDisplayName());
            status.setTokenExpiresAt(connection.getTokenExpiresAt());
        });
        return status;
    }

    @Transactional
    public MusicSessionDto getOrCreateSession(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return toSessionDto(getOrCreateSessionEntity(placeId, ownerUserId));
    }

    @Transactional
    public List<SpotifyPlaylistDto> getPlaylists(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        SpotifyConnectionEntity connection = getConnection(placeId);
        String accessToken = validAccessToken(connection);
        return spotifyClient.getCurrentUserPlaylists(accessToken);
    }

    @Transactional
    public MusicSessionDto selectPlaylist(Integer placeId, SelectPlaylistRequest request, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        if (request == null || request.getPlaylistId() == null || request.getPlaylistId().isBlank()) {
            throw new BadRequestException("Playlist id zorunludur.");
        }

        MusicVenueSessionEntity session = getOrCreateSessionEntity(placeId, ownerUserId);
        SpotifyConnectionEntity connection = getConnection(placeId);
        String accessToken = validAccessToken(connection);

        String playlistName = spotifyClient.getPlaylistName(accessToken, request.getPlaylistId());
        List<TrackDto> tracks = spotifyClient.getPlaylistTracks(accessToken, request.getPlaylistId());
        if (tracks.size() < 2) {
            throw new BadRequestException("Oylama icin playlist en az iki Spotify sarkisi icermelidir.");
        }

        clearRoundsAndVotes(placeId);
        musicTrackRepository.deleteByPlaceId(placeId);
        for (TrackDto track : tracks) {
            MusicTrackEntity entity = new MusicTrackEntity();
            entity.setPlaceId(placeId);
            entity.setPlaylistId(request.getPlaylistId());
            entity.setSpotifyTrackId(track.getSpotifyTrackId());
            entity.setSpotifyUri(track.getSpotifyUri());
            entity.setName(limit(track.getName(), 1024));
            entity.setArtistName(limit(track.getArtistName(), 2048));
            entity.setAlbumName(limit(track.getAlbumName(), 1024));
            entity.setImageUrl(track.getImageUrl());
            entity.setExternalUrl(track.getExternalUrl());
            entity.setPlaylistPosition(track.getPlaylistPosition());
            entity.setActive(true);
            musicTrackRepository.save(entity);
        }

        session.setSelectedPlaylistId(request.getPlaylistId());
        session.setPlaylistName(playlistName);
        session.setCurrentTrackOffset(0);
        session.setActive(true);
        return toSessionDto(musicVenueSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<TrackDto> getTracks(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return musicTrackRepository.findByPlaceIdOrderByPlaylistPositionAsc(placeId)
                .stream()
                .map(this::toTrackDto)
                .toList();
    }

    @Transactional
    public VoteRoundDto startNextRound(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        MusicVenueSessionEntity session = getSessionByPlace(placeId);

        voteRoundRepository.findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(placeId, VoteRoundStatus.ACTIVE)
                .ifPresent(round -> {
                    throw new BadRequestException("Aktif bir oylama turu zaten var.");
                });

        if (session.getSelectedPlaylistId() == null || session.getSelectedPlaylistId().isBlank()) {
            throw new BadRequestException("Once Spotify playlist secilmelidir.");
        }

        List<MusicTrackEntity> tracks = musicTrackRepository.findByPlaceIdAndPlaylistIdOrderByPlaylistPositionAsc(placeId, session.getSelectedPlaylistId());
        if (tracks.size() < 2) {
            throw new BadRequestException("Oylama icin en az iki sarki gerekir.");
        }

        int offset = session.getCurrentTrackOffset() == null ? 0 : session.getCurrentTrackOffset();
        if (offset >= tracks.size()) {
            offset = 0;
        }

        MusicTrackEntity left = tracks.get(offset);
        MusicTrackEntity right = tracks.get((offset + 1) % tracks.size());
        if (left.getId().equals(right.getId())) {
            throw new BadRequestException("Oylama icin farkli iki sarki gerekir.");
        }

        int nextRoundNumber = voteRoundRepository.findTopByPlaceIdOrderByRoundNumberDesc(placeId)
                .map(round -> round.getRoundNumber() + 1)
                .orElse(1);

        VoteRoundEntity round = new VoteRoundEntity();
        round.setPlaceId(placeId);
        round.setQrCode(session.getQrCode());
        round.setRoundNumber(nextRoundNumber);
        round.setLeftTrackId(left.getId());
        round.setRightTrackId(right.getId());
        round.setStatus(VoteRoundStatus.ACTIVE);
        round = voteRoundRepository.save(round);

        session.setCurrentTrackOffset((offset + 2) % tracks.size());
        musicVenueSessionRepository.save(session);

        return toRoundDto(round);
    }

    @Transactional
    public VoteRoundDto closeCurrentRoundAndPlayWinner(Integer placeId, CloseRoundRequest request, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        VoteRoundEntity round = voteRoundRepository.findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(placeId, VoteRoundStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Aktif oylama turu bulunamadi."));

        long leftVotes = voteRepository.countByRoundIdAndTrackId(round.getId(), round.getLeftTrackId());
        long rightVotes = voteRepository.countByRoundIdAndTrackId(round.getId(), round.getRightTrackId());
        Integer winnerTrackId = rightVotes > leftVotes ? round.getRightTrackId() : round.getLeftTrackId();

        round.setWinnerTrackId(winnerTrackId);
        round.setStatus(VoteRoundStatus.CLOSED);
        round.setClosedAt(LocalDateTime.now());
        round = voteRoundRepository.save(round);

        MusicTrackEntity winner = musicTrackRepository.findByIdAndPlaceId(winnerTrackId, placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Kazanan sarki bulunamadi."));
        SpotifyConnectionEntity connection = getConnection(placeId);
        spotifyClient.startPlayback(
                validAccessToken(connection),
                winner.getSpotifyUri(),
                request == null ? null : request.getDeviceId()
        );

        return toRoundDto(round);
    }

    @Transactional(readOnly = true)
    public PublicVoteSessionDto getPublicSession(String qrCode) {
        MusicVenueSessionEntity session = getSessionByQr(qrCode);
        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new BadRequestException("Bu QR oylamasi aktif degil.");
        }

        PublicVoteSessionDto dto = new PublicVoteSessionDto();
        dto.setPlaceId(session.getPlaceId());
        dto.setQrCode(session.getQrCode());
        dto.setPlaylistName(session.getPlaylistName());
        voteRoundRepository.findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(session.getPlaceId(), VoteRoundStatus.ACTIVE)
                .ifPresent(round -> dto.setCurrentRound(toRoundDto(round)));
        return dto;
    }

    @Transactional
    public VoteResultDto vote(String qrCode, VoteRequest request, String remoteAddress, String userAgent) {
        if (request == null || request.getRoundId() == null || request.getTrackId() == null) {
            throw new BadRequestException("Oy icin roundId ve trackId zorunludur.");
        }

        MusicVenueSessionEntity session = getSessionByQr(qrCode);
        VoteRoundEntity round = voteRoundRepository.findByIdAndPlaceId(request.getRoundId(), session.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Oylama turu bulunamadi."));

        if (round.getStatus() != VoteRoundStatus.ACTIVE) {
            throw new BadRequestException("Bu oylama turu kapali.");
        }
        if (!request.getTrackId().equals(round.getLeftTrackId()) && !request.getTrackId().equals(round.getRightTrackId())) {
            throw new BadRequestException("Secilen sarki bu turda yer almiyor.");
        }

        String voterKey = voterKey(qrCode, request.getVoterKey(), remoteAddress, userAgent);
        VoteResultDto result = new VoteResultDto();

        if (voteRepository.findByRoundIdAndVoterKey(round.getId(), voterKey).isPresent()) {
            result.setAccepted(false);
            result.setDuplicate(true);
            result.setRound(toRoundDto(round));
            return result;
        }

        VoteEntity vote = new VoteEntity();
        vote.setRoundId(round.getId());
        vote.setTrackId(request.getTrackId());
        vote.setVoterKey(voterKey);
        voteRepository.save(vote);

        result.setAccepted(true);
        result.setDuplicate(false);
        result.setRound(toRoundDto(round));
        return result;
    }

    @Transactional(readOnly = true)
    public MusicSessionDto getSessionByQrCode(String qrCode) {
        return toSessionDto(getSessionByQr(qrCode));
    }

    private SpotifyConnectionEntity getConnection(Integer placeId) {
        return spotifyConnectionRepository.findByPlaceId(placeId)
                .orElseThrow(() -> new BadRequestException("Bu mekan icin Spotify hesabi bagli degil."));
    }

    private String validAccessToken(SpotifyConnectionEntity connection) {
        if (connection.getTokenExpiresAt().isAfter(LocalDateTime.now().plusSeconds(60))) {
            return connection.getAccessToken();
        }
        if (connection.getRefreshToken() == null || connection.getRefreshToken().isBlank()) {
            throw new BadRequestException("Spotify token suresi doldu ve refresh token yok.");
        }

        SpotifyTokenResponse refreshed = spotifyClient.refreshToken(connection.getRefreshToken());
        connection.setAccessToken(refreshed.getAccessToken());
        if (refreshed.getRefreshToken() != null && !refreshed.getRefreshToken().isBlank()) {
            connection.setRefreshToken(refreshed.getRefreshToken());
        }
        connection.setTokenType(refreshed.getTokenType());
        connection.setScope(refreshed.getScope());
        connection.setTokenExpiresAt(LocalDateTime.now().plusSeconds(refreshed.getExpiresIn() == null ? 3600 : refreshed.getExpiresIn()));
        spotifyConnectionRepository.save(connection);
        return connection.getAccessToken();
    }

    private MusicVenueSessionEntity getOrCreateSessionEntity(Integer placeId, Integer ownerUserId) {
        if (placeId == null) {
            throw new BadRequestException("Mekan id zorunludur.");
        }
        return musicVenueSessionRepository.findByPlaceId(placeId)
                .orElseGet(() -> {
                    MusicVenueSessionEntity session = new MusicVenueSessionEntity();
                    session.setPlaceId(placeId);
                    session.setOwnerUserId(ownerUserId);
                    session.setQrCode(uniqueQrCode());
                    session.setActive(true);
                    session.setCurrentTrackOffset(0);
                    session.setPublicVotingUrl(publicVotingUrl(session.getQrCode()));
                    return musicVenueSessionRepository.save(session);
                });
    }

    private MusicVenueSessionEntity getSessionByPlace(Integer placeId) {
        return musicVenueSessionRepository.findByPlaceId(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Mekan muzik oylama oturumu bulunamadi."));
    }

    private MusicVenueSessionEntity getSessionByQr(String qrCode) {
        return musicVenueSessionRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("QR oylama oturumu bulunamadi."));
    }

    private void clearRoundsAndVotes(Integer placeId) {
        List<Integer> roundIds = voteRoundRepository.findByPlaceId(placeId)
                .stream()
                .map(VoteRoundEntity::getId)
                .toList();
        if (!roundIds.isEmpty()) {
            voteRepository.deleteByRoundIdIn(roundIds);
        }
        voteRoundRepository.deleteByPlaceId(placeId);
    }

    private MusicSessionDto toSessionDto(MusicVenueSessionEntity entity) {
        MusicSessionDto dto = new MusicSessionDto();
        dto.setPlaceId(entity.getPlaceId());
        dto.setOwnerUserId(entity.getOwnerUserId());
        dto.setQrCode(entity.getQrCode());
        dto.setPublicVotingUrl(entity.getPublicVotingUrl());
        dto.setQrImageUrl(musicVoteProperties.getGatewayBaseUrl() + "/music-service/api/music-votes/public/" + entity.getQrCode() + "/qr.png");
        dto.setSelectedPlaylistId(entity.getSelectedPlaylistId());
        dto.setPlaylistName(entity.getPlaylistName());
        dto.setActive(entity.getActive());
        dto.setTrackCount(musicTrackRepository.countByPlaceId(entity.getPlaceId()));
        return dto;
    }

    private SpotifyConnectionStatusDto toConnectionStatus(SpotifyConnectionEntity connection) {
        SpotifyConnectionStatusDto dto = new SpotifyConnectionStatusDto();
        dto.setPlaceId(connection.getPlaceId());
        dto.setConnected(true);
        dto.setSpotifyUserId(connection.getSpotifyUserId());
        dto.setDisplayName(connection.getDisplayName());
        dto.setTokenExpiresAt(connection.getTokenExpiresAt());
        return dto;
    }

    private VoteRoundDto toRoundDto(VoteRoundEntity entity) {
        VoteRoundDto dto = new VoteRoundDto();
        dto.setId(entity.getId());
        dto.setRoundNumber(entity.getRoundNumber());
        dto.setStatus(entity.getStatus());
        dto.setLeftTrack(musicTrackRepository.findById(entity.getLeftTrackId()).map(this::toTrackDto).orElse(null));
        dto.setRightTrack(musicTrackRepository.findById(entity.getRightTrackId()).map(this::toTrackDto).orElse(null));
        dto.setLeftVotes(voteRepository.countByRoundIdAndTrackId(entity.getId(), entity.getLeftTrackId()));
        dto.setRightVotes(voteRepository.countByRoundIdAndTrackId(entity.getId(), entity.getRightTrackId()));
        dto.setWinnerTrack(entity.getWinnerTrackId() == null
                ? null
                : musicTrackRepository.findById(entity.getWinnerTrackId()).map(this::toTrackDto).orElse(null));
        return dto;
    }

    private TrackDto toTrackDto(MusicTrackEntity entity) {
        TrackDto dto = new TrackDto();
        dto.setId(entity.getId());
        dto.setSpotifyTrackId(entity.getSpotifyTrackId());
        dto.setSpotifyUri(entity.getSpotifyUri());
        dto.setName(entity.getName());
        dto.setArtistName(entity.getArtistName());
        dto.setAlbumName(entity.getAlbumName());
        dto.setImageUrl(entity.getImageUrl());
        dto.setExternalUrl(entity.getExternalUrl());
        dto.setPlaylistPosition(entity.getPlaylistPosition());
        return dto;
    }

    private void requireOwner(Integer ownerUserId, String userRole) {
        if (ownerUserId == null) {
            throw new BadRequestException("Kullanici kimligi bulunamadi.");
        }
        UserRole role = resolveRole(userRole);
        if (role != UserRole.ADMIN && role != UserRole.MANAGER) {
            throw new BadRequestException("Bu islem icin ADMIN veya MANAGER rol gerekir.");
        }
    }

    private UserRole resolveRole(String role) {
        try {
            return role == null ? null : UserRole.fromValue(role);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String uniqueQrCode() {
        String qrCode;
        do {
            qrCode = generateToken(12);
        } while (musicVenueSessionRepository.existsByQrCode(qrCode));
        return qrCode;
    }

    private String generateToken(int byteCount) {
        byte[] bytes = new byte[byteCount];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String publicVotingUrl(String qrCode) {
        String template = musicVoteProperties.getPublicUrlTemplate();
        if (template == null || template.isBlank()) {
            return qrCode;
        }
        return String.format(template, qrCode);
    }

    private String voterKey(String qrCode, String clientKey, String remoteAddress, String userAgent) {
        String value = clientKey == null || clientKey.isBlank()
                ? qrCode + "|" + nullSafe(remoteAddress) + "|" + nullSafe(userAgent)
                : qrCode + "|" + clientKey;
        return sha256(value);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new BadRequestException("Oy veren anahtari olusturulamadi.");
        }
    }

    private String text(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}

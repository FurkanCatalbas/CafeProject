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
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MusicVoteService {

    private final SpotifyClient spotifyClient;
    private final MusicVoteProperties musicVoteProperties;
    private final SpotifyOAuthStateRepository spotifyOAuthStateRepository;
    private final SpotifyConnectionRepository spotifyConnectionRepository;
    private final MusicVenueSessionRepository musicVenueSessionRepository;
    private final MusicTrackRepository musicTrackRepository;
    private final VoteRoundRepository voteRoundRepository;
    private final VoteRepository voteRepository;
    private final TransactionTemplate transactionTemplate;
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

        SpotifyConnectionEntity connection = spotifyConnectionRepository.findByPlaceIdAndOwnerUserId(stateEntity.getPlaceId(), stateEntity.getOwnerUserId())
                .orElse(new SpotifyConnectionEntity());
        
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
        
        connection = spotifyConnectionRepository.saveAndFlush(connection);

        stateEntity.setUsed(true);
        spotifyOAuthStateRepository.save(stateEntity);

        return toConnectionStatus(connection);
    }

    @Transactional(readOnly = true)
    public SpotifyConnectionStatusDto getSpotifyConnectionStatus(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        SpotifyConnectionStatusDto status = new SpotifyConnectionStatusDto();
        status.setPlaceId(placeId);
        spotifyConnectionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId).ifPresent(connection -> {
            status.setConnected(true);
            status.setSpotifyUserId(connection.getSpotifyUserId());
            status.setDisplayName(connection.getDisplayName());
            status.setTokenExpiresAt(connection.getTokenExpiresAt());
        });
        return status;
    }

    @Transactional
    public void disconnectSpotify(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        spotifyConnectionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId).ifPresent(connection -> {
            spotifyConnectionRepository.delete(connection);
            
            // Ayrıca mevcut oturumun playlist bilgilerini temizleyelim
            musicVenueSessionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId).ifPresent(session -> {
                session.setSelectedPlaylistId(null);
                session.setPlaylistName(null);
                session.setActive(false);
                musicVenueSessionRepository.save(session);
            });
            
            // Oylamaları ve parçaları da temizle
            clearRoundsAndVotes(placeId);
            musicTrackRepository.deleteByPlaceId(placeId);
        });
    }

    @Transactional
    public MusicSessionDto getOrCreateSession(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return toSessionDto(getOrCreateSessionEntity(placeId, ownerUserId));
    }

    @Transactional
    public List<SpotifyPlaylistDto> getPlaylists(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        SpotifyConnectionEntity connection = getConnection(placeId, ownerUserId);
        String accessToken = validAccessToken(connection);
        return spotifyClient.getCurrentUserPlaylists(accessToken);
    }

    // @Transactional yok — Spotify HTTP cagrilari transaction disinda yapilir
    public MusicSessionDto selectPlaylist(Integer placeId, SelectPlaylistRequest request, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        if (request == null || request.getPlaylistId() == null || request.getPlaylistId().isBlank()) {
            throw new BadRequestException("Playlist id zorunludur.");
        }

        // Asama 1: Access token al (kisa transaction)
        String accessToken = transactionTemplate.execute(status -> {
            SpotifyConnectionEntity connection = getConnection(placeId, ownerUserId);
            return validAccessToken(connection);
        });

        // Asama 2: Spotify HTTP cagrisi — DB connection TUTULMUYOR
        String playlistName = spotifyClient.getPlaylistName(accessToken, request.getPlaylistId());
        List<TrackDto> tracks = spotifyClient.getPlaylistTracks(accessToken, request.getPlaylistId());
        if (tracks.size() < 2) {
            throw new BadRequestException("Oylama icin playlist en az iki Spotify sarkisi icermelidir.");
        }
        log.info("Playlist seciliyor: placeId={}, playlistId={}, trackCount={}", placeId, request.getPlaylistId(), tracks.size());

        // Asama 3: DB kayit (kisa transaction, HTTP cagrisi yok)
        final String finalPlaylistName = playlistName;
        final List<TrackDto> finalTracks = tracks;
        return transactionTemplate.execute(status ->
                persistPlaylistData(placeId, request.getPlaylistId(), ownerUserId, finalPlaylistName, finalTracks)
        );
    }

    private MusicSessionDto persistPlaylistData(Integer placeId, String playlistId, Integer ownerUserId,
                                                 String playlistName, List<TrackDto> tracks) {
        MusicVenueSessionEntity session = getOrCreateSessionEntity(placeId, ownerUserId);

        clearRoundsAndVotes(placeId);
        musicTrackRepository.deleteByPlaceId(placeId);

        java.util.Set<String> processedUris = new java.util.HashSet<>();
        for (TrackDto track : tracks) {
            if (track.getSpotifyUri() == null || processedUris.contains(track.getSpotifyUri())) {
                continue;
            }
            MusicTrackEntity entity = new MusicTrackEntity();
            entity.setPlaceId(placeId);
            entity.setPlaylistId(playlistId);
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
            processedUris.add(track.getSpotifyUri());
        }

        log.info("Toplam {} sarki kaydedildi, oturum guncelleniyor.", processedUris.size());
        session.setSelectedPlaylistId(playlistId);
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

    @Transactional(readOnly = true)
    public VoteRoundDto getCurrentRound(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return voteRoundRepository.findFirstByPlaceIdAndStatusOrderByRoundNumberDesc(placeId, VoteRoundStatus.ACTIVE)
                .map(this::toRoundDto)
                .orElse(null);
    }

    // @Transactional yok — Spotify HTTP cagrisi (getPlaybackState) transaction disinda kalir, pool size=1 ile deadlock onlenir
    public VoteRoundDto startNextRound(Integer placeId, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return startNextRoundInternal(placeId, ownerUserId);
    }

    private VoteRoundDto startNextRoundInternal(Integer placeId, Integer ownerUserId) {
        MusicVenueSessionEntity session = ownerUserId != null
                ? musicVenueSessionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId)
                        .orElseGet(() -> getSessionByPlace(placeId))
                : getSessionByPlace(placeId);

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

        // Spotify durumuna göre geçiş süresi belirle
        LocalDateTime targetTransitionAt = LocalDateTime.now().plusMinutes(3); // Varsayılan: 3 dk
        try {
            SpotifyConnectionEntity connection = spotifyConnectionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId).orElse(null);
            if (connection != null) {
                JsonNode playback = spotifyClient.getPlaybackState(validAccessToken(connection));
                if (playback.has("is_playing") && playback.get("is_playing").asBoolean()) {
                    long duration = playback.path("item").path("duration_ms").asLong(0);
                    long progress = playback.path("progress_ms").asLong(0);
                    if (duration > progress) {
                        // Şarkı bitimine 2 saniye kala tetikle
                        targetTransitionAt = LocalDateTime.now().plusNanos((duration - progress + 2000) * 1_000_000L);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Spotify calma durumu alinirken hata olustu, 3 dk varsayilanina donuluyor: {}", e.getMessage());
        }

        VoteRoundEntity round = new VoteRoundEntity();
        round.setPlaceId(placeId);
        round.setQrCode(session.getQrCode());
        round.setRoundNumber(nextRoundNumber);
        round.setLeftTrackId(left.getId());
        round.setRightTrackId(right.getId());
        round.setStatus(VoteRoundStatus.ACTIVE);
        round.setAutoTransition(true);
        round.setTargetTransitionAt(targetTransitionAt);
        round = voteRoundRepository.save(round);

        session.setCurrentTrackOffset((offset + 2) % tracks.size());
        musicVenueSessionRepository.save(session);

        return toRoundDto(round);
    }

    @Scheduled(fixedDelay = 10000) // 10 saniyede bir kontrol et
    public void processAutoTransitions() {
        LocalDateTime now = LocalDateTime.now();
        List<VoteRoundEntity> roundsToClose = voteRoundRepository.findAllByStatusAndAutoTransitionTrueAndTargetTransitionAtBefore(
                VoteRoundStatus.ACTIVE, now);

        for (VoteRoundEntity round : roundsToClose) {
            MusicVenueSessionEntity session = musicVenueSessionRepository.findFirstByPlaceIdOrderByIdAsc(round.getPlaceId()).orElse(null);
            if (session == null || session.getOwnerUserId() == null) continue;

            // Tur kapatma ve Spotify calma — ayri try/catch: Spotify hatasi yeni turu engellemesin
            try {
                log.info("Otomatik gecis tetikleniyor: Mekan {}, Tur {}", round.getPlaceId(), round.getRoundNumber());
                closeCurrentRoundAndPlayWinnerInternal(round.getPlaceId(), null, session.getOwnerUserId());
            } catch (Exception e) {
                log.error("Tur kapatma sirasinda hata (Mekan {}): {}", round.getPlaceId(), e.getMessage());
            }

            // Yeni turu her durumda baslatmaya calis (onceki tur kapatildi veya zaten kapali)
            try {
                startNextRoundInternal(round.getPlaceId(), session.getOwnerUserId());
            } catch (Exception e) {
                log.error("Yeni tur baslatma sirasinda hata (Mekan {}): {}", round.getPlaceId(), e.getMessage());
            }
        }
    }

    // @Transactional yok — round.save() aninda commit edilir; Spotify startPlayback hatasi round'u geri acmaz
    public VoteRoundDto closeCurrentRoundAndPlayWinner(Integer placeId, CloseRoundRequest request, Integer ownerUserId, String userRole) {
        requireOwner(ownerUserId, userRole);
        return closeCurrentRoundAndPlayWinnerInternal(placeId, request, ownerUserId);
    }

    private VoteRoundDto closeCurrentRoundAndPlayWinnerInternal(Integer placeId, CloseRoundRequest request, Integer ownerUserId) {
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
        SpotifyConnectionEntity connection = getConnection(placeId, ownerUserId);
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

    @Transactional(readOnly = true)
    public PublicVoteSessionDto getPublicSessionByPlaceId(Integer placeId) {
        // Önce verilen masa/mekan ID'si ile ara; yoksa herhangi aktif oturumu döndür (tek venue senaryosu)
        MusicVenueSessionEntity session = musicVenueSessionRepository.findFirstByPlaceIdOrderByIdAsc(placeId)
                .filter(s -> Boolean.TRUE.equals(s.getActive()))
                .or(() -> musicVenueSessionRepository.findFirstByActiveTrueOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("Aktif müzik oylama oturumu bulunamadı."));

        if (!Boolean.TRUE.equals(session.getActive())) {
            throw new BadRequestException("Bu mekanın oylaması şu an aktif değil.");
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

    private SpotifyConnectionEntity getConnection(Integer placeId, Integer ownerUserId) {
        return spotifyConnectionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId)
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
        
        // Önce bu kullanıcıya ait olanı bulmaya çalış
        java.util.Optional<MusicVenueSessionEntity> existing = musicVenueSessionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Yoksa oluştur
        try {
            MusicVenueSessionEntity session = new MusicVenueSessionEntity();
            session.setPlaceId(placeId);
            session.setOwnerUserId(ownerUserId);
            session.setQrCode(uniqueQrCode());
            session.setActive(true);
            session.setCurrentTrackOffset(0);
            session.setPublicVotingUrl(publicVotingUrl(session.getQrCode()));
            
            return musicVenueSessionRepository.saveAndFlush(session);
        } catch (Exception e) {
            // Eğer o sırada başka bir istek eklediyse veritabanına tekrar bak
            return musicVenueSessionRepository.findByPlaceIdAndOwnerUserId(placeId, ownerUserId)
                    .orElseThrow(() -> new BadRequestException("Muzik oturumu olusturulamadi veya alinamadi."));
        }
    }

    private MusicVenueSessionEntity getSessionByPlace(Integer placeId) {
        return musicVenueSessionRepository.findFirstByPlaceIdOrderByIdAsc(placeId)
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
            log.info("Siliniyor: {} oy turu ve oylar (placeId={})", roundIds.size(), placeId);
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
        if (ownerUserId == null || ownerUserId == 0) {
           // log.warn("Auth context eksik veya anonim kullanıcı: userId={}, role={}", ownerUserId, userRole);
            // Geliştirme/Test aşamasında veya anonim erişime izin verilen durumlarda hata fırlatmak yerine devam edebiliriz
            // Veya daha açıklayıcı bir hata mesajı dönebiliriz.
            throw new BadRequestException("İşlem için geçerli bir kullanıcı oturumu gereklidir (UserId eksik).");
        }
        
        UserRole role = resolveRole(userRole);
        if (role != UserRole.ADMIN && role != UserRole.MANAGER) {
            //log.error("Yetkisiz rol erişimi: userId={}, role={}", ownerUserId, userRole);
            throw new BadRequestException("Bu işlem için yetkiniz bulunmamaktadır (Sadece MÜDÜR veya ADMIN).");
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

package com.musicvoteservice.controllers;

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
import com.musicvoteservice.services.MusicVoteService;
import com.musicvoteservice.services.QrCodeService;
import com.wise.core.models.QueryResponse;
import com.wise.core.models.QueryResponses;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/music-votes")
@RequiredArgsConstructor
public class MusicVoteController {

    private final MusicVoteService musicVoteService;
    private final QrCodeService qrCodeService;

    @GetMapping("/spotify/authorize")
    public ResponseEntity<QueryResponse<SpotifyAuthorizeResponse>> authorizeSpotify(
            @RequestParam("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.createSpotifyAuthorization(placeId, userId, userRole)));
    }

    @GetMapping("/spotify/callback")
    public ResponseEntity<QueryResponse<SpotifyConnectionStatusDto>> spotifyCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        return ResponseEntity.ok(single(musicVoteService.handleSpotifyCallback(code, state)));
    }

    @GetMapping("/venues/{placeId}")
    public ResponseEntity<QueryResponse<MusicSessionDto>> getOrCreateSession(
            @PathVariable("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.getOrCreateSession(placeId, userId, userRole)));
    }

    @GetMapping("/venues/{placeId}/spotify/status")
    public ResponseEntity<QueryResponse<SpotifyConnectionStatusDto>> spotifyStatus(
            @PathVariable("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.getSpotifyConnectionStatus(placeId, userId, userRole)));
    }

    @GetMapping("/venues/{placeId}/spotify/playlists")
    public ResponseEntity<QueryResponses<SpotifyPlaylistDto>> playlists(
            @PathVariable("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(list(musicVoteService.getPlaylists(placeId, userId, userRole)));
    }

    @PostMapping("/venues/{placeId}/playlist")
    public ResponseEntity<QueryResponse<MusicSessionDto>> selectPlaylist(
            @PathVariable("placeId") Integer placeId,
            @RequestBody SelectPlaylistRequest request,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.selectPlaylist(placeId, request, userId, userRole)));
    }

    @GetMapping("/venues/{placeId}/tracks")
    public ResponseEntity<QueryResponses<TrackDto>> tracks(
            @PathVariable("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(list(musicVoteService.getTracks(placeId, userId, userRole)));
    }

    @PostMapping("/venues/{placeId}/rounds/start")
    public ResponseEntity<QueryResponse<VoteRoundDto>> startRound(
            @PathVariable("placeId") Integer placeId,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.startNextRound(placeId, userId, userRole)));
    }

    @PostMapping("/venues/{placeId}/rounds/current/close")
    public ResponseEntity<QueryResponse<VoteRoundDto>> closeRound(
            @PathVariable("placeId") Integer placeId,
            @RequestBody(required = false) CloseRoundRequest request,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.ok(single(musicVoteService.closeCurrentRoundAndPlayWinner(placeId, request, userId, userRole)));
    }

    @GetMapping("/public/{qrCode}")
    public ResponseEntity<QueryResponse<PublicVoteSessionDto>> publicSession(@PathVariable("qrCode") String qrCode) {
        return ResponseEntity.ok(single(musicVoteService.getPublicSession(qrCode)));
    }

    @PostMapping("/public/{qrCode}/vote")
    public ResponseEntity<QueryResponse<VoteResultDto>> vote(
            @PathVariable("qrCode") String qrCode,
            @RequestBody VoteRequest request,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(single(musicVoteService.vote(
                qrCode,
                request,
                servletRequest.getRemoteAddr(),
                servletRequest.getHeader(HttpHeaders.USER_AGENT)
        )));
    }

    @GetMapping(value = "/public/{qrCode}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrPng(@PathVariable("qrCode") String qrCode) {
        MusicSessionDto session = musicVoteService.getSessionByQrCode(qrCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCodeService.createPng(session.getPublicVotingUrl()));
    }

    private <T> QueryResponse<T> single(T data) {
        QueryResponse<T> response = new QueryResponse<>();
        response.setData(data);
        return response;
    }

    private <T> QueryResponses<T> list(List<T> data) {
        QueryResponses<T> response = new QueryResponses<>();
        response.setData(data);
        return response;
    }
}

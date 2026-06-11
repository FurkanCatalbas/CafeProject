package com.musicvoteservice.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixerConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixConstraints() {
        log.info("Veritabani yapisi kontrol ediliyor ve duzeltiliyor...");
        
        // 1. Music Venue Sessions - Eski kısıtlamayı kaldır
        try {
            jdbcTemplate.execute("ALTER TABLE MUSIC_VENUE_SESSIONS DROP CONSTRAINT IF EXISTS uk_music_session_place");
            log.info("uk_music_session_place kisitlamasi kaldirildi.");
        } catch (Exception e) {
            log.warn("uk_music_session_place kaldirilamadi (muhtemelen zaten yok): {}", e.getMessage());
        }
        
        // 2. Spotify Connections - Eski kısıtlamayı kaldır
        try {
            jdbcTemplate.execute("ALTER TABLE MUSIC_SPOTIFY_CONNECTIONS DROP CONSTRAINT IF EXISTS uk_music_spotify_place");
            log.info("uk_music_spotify_place kisitlamasi kaldirildi.");
        } catch (Exception e) {
            log.warn("uk_music_spotify_place kaldirilamadi (muhtemelen zaten yok): {}", e.getMessage());
        }

        // 3. Music Vote Rounds - Yeni kolonları ekle
        try {
            jdbcTemplate.execute("ALTER TABLE MUSIC_VOTE_ROUNDS ADD COLUMN IF NOT EXISTS AUTO_TRANSITION BOOLEAN");
            jdbcTemplate.execute("UPDATE MUSIC_VOTE_ROUNDS SET AUTO_TRANSITION = FALSE WHERE AUTO_TRANSITION IS NULL");
            log.info("AUTO_TRANSITION kolonu eklendi ve varsayilan degerler atandi.");
        } catch (Exception e) {
            log.warn("AUTO_TRANSITION islemi basarisiz: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE MUSIC_VOTE_ROUNDS ADD COLUMN IF NOT EXISTS TARGET_TRANSITION_AT TIMESTAMP");
            log.info("TARGET_TRANSITION_AT kolonu eklendi.");
        } catch (Exception e) {
            log.warn("TARGET_TRANSITION_AT kolonu eklenemedi: {}", e.getMessage());
        }
    }
}

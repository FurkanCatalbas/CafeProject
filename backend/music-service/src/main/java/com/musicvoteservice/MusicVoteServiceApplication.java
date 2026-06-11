package com.musicvoteservice;

import com.musicvoteservice.config.MusicVoteProperties;
import com.musicvoteservice.spotify.SpotifyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = {"com.musicvoteservice", "com.wise.core"})
@EnableDiscoveryClient
@EnableScheduling
@EnableConfigurationProperties({SpotifyProperties.class, MusicVoteProperties.class})
public class MusicVoteServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicVoteServiceApplication.class, args);
    }
}

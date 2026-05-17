package com.musicvoteservice;

import com.musicvoteservice.config.MusicVoteProperties;
import com.musicvoteservice.spotify.SpotifyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.musicvoteservice", "com.wise.core"})
@EnableDiscoveryClient
@EnableConfigurationProperties({SpotifyProperties.class, MusicVoteProperties.class})
public class MusicVoteServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicVoteServiceApplication.class, args);
    }
}

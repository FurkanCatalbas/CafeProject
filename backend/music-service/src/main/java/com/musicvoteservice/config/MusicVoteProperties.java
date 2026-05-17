package com.musicvoteservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "musicvote")
public class MusicVoteProperties {
    private String publicUrlTemplate;
    private String gatewayBaseUrl;
}

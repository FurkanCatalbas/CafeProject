package com.project.gatewayservice.config;

import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.cloud.gateway.config.HttpClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Netty'nin Unix tabanlı varsayılan DNS sağlayıcısı bazı Linux/resolv.conf
 * kombinasyonlarında ExceptionInInitializerError üretebiliyor. JDK çözümleyicisi
 * (DefaultAddressResolverGroup) bu hatayı aşmak için kullanılır.
 */
@Configuration
public class GatewayHttpClientConfig {

    @Bean
    public HttpClientCustomizer jdkDnsResolverCustomizer() {
        return httpClient -> httpClient.resolver(DefaultAddressResolverGroup.INSTANCE);
    }
}

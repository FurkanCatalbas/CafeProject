package com.authservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.awt.*;
import java.net.URI;

@SpringBootApplication
public class AuthServiceApplication {

    @Autowired
    private Environment environment;

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowser() {
        String port = environment.getProperty("local.server.port", "8080");

        String contextPath = environment.getProperty("server.servlet.context-path", "");

        String url = "http://localhost:" + port + contextPath + "/swagger-ui/index.html";

        System.setProperty("java.awt.headless", "false");

        if (!GraphicsEnvironment.isHeadless()) {
            try {
                if (Desktop.isDesktopSupported()) {
                    Desktop.getDesktop().browse(new URI(url));
                } else {
                    Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler " + url);
                }
            } catch (Exception e) {
                System.out.println("Swagger URL: " + url);
            }
        } else {
            // Sunucu ortamındaysak sadece loga yaz
            System.out.println("Uygulama hazır! Swagger adresi: " + url);
        }
    }
}
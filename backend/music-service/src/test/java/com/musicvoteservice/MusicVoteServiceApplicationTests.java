package com.musicvoteservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:musicvotedb;DB_CLOSE_DELAY=-1;MODE=MSSQLServer",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "eureka.client.enabled=false"
})
class MusicVoteServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}

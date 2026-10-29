package com.gilmmerr.site.config;

import com.gilmmerr.site.service.SeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupRunner implements ApplicationRunner {

    private final SeedService seedService;

    @Override
    public void run(ApplicationArguments args) {
        seedService.seedIfEmpty();
        log.info("内容接口已就绪：GET/PUT http://127.0.0.1:8081/api/content");
    }
}

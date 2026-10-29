package com.gilmmerr.site.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 只放行本机页面调用，避免把写接口暴露给任意来源。
 * 正常开发走 Vite 的 /api 代理（同源），这里主要是给「直接访问 8080」的场景兜底。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "PUT", "POST", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}

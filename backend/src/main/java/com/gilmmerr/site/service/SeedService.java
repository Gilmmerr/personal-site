package com.gilmmerr.site.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gilmmerr.site.model.Content;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;

/**
 * 初始内容（seed）。
 *
 * <p>seed.json 由 `npm run export:seed` 从前端 src/data 导出，跟着后端一起打包。
 * 数据库为空时自动灌入一次；后台点「恢复初始内容」也走这里。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeedService {

    private static final String SEED_PATH = "db/seed.json";

    private final ContentService contentService;
    private final ObjectMapper objectMapper;

    private Content seed;

    @PostConstruct
    void load() {
        ClassPathResource resource = new ClassPathResource(SEED_PATH);
        if (!resource.exists()) {
            log.warn("没有找到 {}，数据库为空时站点会使用前端内置的默认内容", SEED_PATH);
            return;
        }
        try (InputStream in = resource.getInputStream()) {
            seed = objectMapper.readValue(in, Content.class);
            log.info("已载入初始内容：{} 个项目 / {} 篇文章", seed.getProjects().size(), seed.getPosts().size());
        } catch (Exception e) {
            log.warn("初始内容解析失败：{}", e.getMessage());
        }
    }

    public boolean hasSeed() {
        return seed != null;
    }

    public Content resetToSeed() {
        if (seed == null) {
            throw new IllegalStateException("没有可用的初始内容文件");
        }
        return contentService.saveContent(seed);
    }

    /** 首次启动且表为空时自动灌入，避免前端打开是空白站 */
    public void seedIfEmpty() {
        if (seed == null) return;
        if (contentService.isEmpty()) {
            log.info("数据库为空，正在写入初始内容…");
            contentService.saveContent(seed);
        }
    }
}

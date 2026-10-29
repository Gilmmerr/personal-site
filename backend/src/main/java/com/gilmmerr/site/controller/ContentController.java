package com.gilmmerr.site.controller;

import com.gilmmerr.site.model.Content;
import com.gilmmerr.site.service.ContentService;
import com.gilmmerr.site.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final SeedService seedService;

    /** 站点启动时拉取全部内容 */
    @GetMapping("/content")
    public Content getContent() {
        return contentService.readContent();
    }

    /** 后台保存：整份内容覆盖写入 */
    @PutMapping("/content")
    public Content saveContent(@RequestBody Content content) {
        return contentService.saveContent(content);
    }

    /** 恢复成项目自带的初始内容 */
    @PostMapping("/content/reset")
    public Content reset() {
        return seedService.resetToSeed();
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("contentEmpty", contentService.isEmpty());
        result.put("seedAvailable", seedService.hasSeed());
        return result;
    }
}

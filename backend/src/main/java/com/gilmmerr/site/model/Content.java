package com.gilmmerr.site.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 站点内容的完整结构。
 *
 * <p>字段名与前端 TypeScript 的 Content 定义一一对应（见 src/lib/content.ts），
 * 后端不做额外包装，直接原样序列化给前端，避免两边各写一套映射。</p>
 */
@Data
public class Content {

    private int version = 1;
    private String updatedAt;
    private Site site = new Site();
    private List<SkillGroup> skillGroups = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Post> posts = new ArrayList<>();

    /** 站点基本信息 + 首页各区块的文案 */
    @Data
    public static class Site {
        private String name;
        private String role;
        private String tagline;
        private String email;
        private String location;
        private String avatar;
        private String resumeUrl;
        private List<String> intro = new ArrayList<>();
        private List<Social> socials = new ArrayList<>();
        private List<NavItem> nav = new ArrayList<>();
        private List<TimelineItem> timeline = new ArrayList<>();
        private List<Fact> facts = new ArrayList<>();
    }

    @Data
    public static class Social {
        private String label;
        private String href;
        private String icon;
    }

    @Data
    public static class NavItem {
        private String label;
        private String id;
        private String to;
    }

    @Data
    public static class TimelineItem {
        private String period;
        private String title;
        private String org;
        private String desc;
    }

    @Data
    public static class Fact {
        private String label;
        private String value;
    }

    @Data
    public static class SkillGroup {
        private String group;
        private String desc;
        private List<SkillItem> items = new ArrayList<>();
    }

    @Data
    public static class SkillItem {
        private String name;
        private String icon;
        private int level;
    }

    @Data
    public static class Project {
        private String slug;
        private String title;
        private String summary;
        private String year;
        private String role;
        private String cover;
        private String glyph;
        private List<String> tags = new ArrayList<>();
        private List<ProjectLink> links = new ArrayList<>();
        private String background;
        private List<String> approach = new ArrayList<>();
        private List<Challenge> challenges = new ArrayList<>();
        private String outcome;
    }

    @Data
    public static class ProjectLink {
        private String label;
        private String href;
    }

    @Data
    public static class Challenge {
        private String title;
        private String detail;
    }

    @Data
    public static class Post {
        private String slug;
        private String title;
        private String date;
        private List<String> tags = new ArrayList<>();
        private String summary;
        private String body;
    }
}

package com.gilmmerr.site.service;

import com.gilmmerr.site.mapper.ContentMapper;
import com.gilmmerr.site.model.Content;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 内容读写。
 *
 * <p>读：把十几张表拼回前端需要的嵌套结构。
 * 写：在一个事务里先清空再用本次提交的数据重建 —— 后台是「整份内容一起保存」的交互，
 * 覆盖写比逐条 diff 简单，也不会残留孤儿行（外键上仍配了级联删除兜底）。</p>
 */
@Service
@RequiredArgsConstructor
public class ContentService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private final ContentMapper mapper;

    /* ============================ 读 ============================ */

    public Content readContent() {
        Content content = new Content();

        Map<String, Object> profile = mapper.selectProfile();
        Content.Site site = content.getSite();
        if (profile != null) {
            site.setName(str(profile, "name"));
            site.setRole(str(profile, "role"));
            site.setTagline(str(profile, "tagline"));
            site.setEmail(str(profile, "email"));
            site.setLocation(str(profile, "location"));
            site.setAvatar(str(profile, "avatar"));
            site.setResumeUrl(str(profile, "resumeUrl"));
            content.setUpdatedAt(str(profile, "updatedAt"));
        }

        site.setIntro(new ArrayList<>(mapper.selectIntroTexts()));

        List<Content.Fact> facts = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectFacts()) {
            Content.Fact fact = new Content.Fact();
            fact.setLabel(str(row, "label"));
            fact.setValue(str(row, "value"));
            facts.add(fact);
        }
        site.setFacts(facts);

        List<Content.Social> socials = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectSocials()) {
            Content.Social social = new Content.Social();
            social.setLabel(str(row, "label"));
            social.setHref(str(row, "href"));
            social.setIcon(str(row, "icon"));
            socials.add(social);
        }
        site.setSocials(socials);

        List<Content.NavItem> navs = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectNavs()) {
            Content.NavItem nav = new Content.NavItem();
            nav.setLabel(str(row, "label"));
            nav.setId(blankToNull(str(row, "id")));
            nav.setTo(blankToNull(str(row, "to")));
            navs.add(nav);
        }
        site.setNav(navs);

        List<Content.TimelineItem> timeline = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectTimelines()) {
            Content.TimelineItem item = new Content.TimelineItem();
            item.setPeriod(str(row, "period"));
            item.setTitle(str(row, "title"));
            item.setOrg(str(row, "org"));
            item.setDesc(str(row, "desc"));
            timeline.add(item);
        }
        site.setTimeline(timeline);

        // 技能：先按 groupId 把明细归拢，再挂到对应分组下
        Map<Long, List<Content.SkillItem>> skillMap = new LinkedHashMap<>();
        for (Map<String, Object> row : mapper.selectSkillItems()) {
            Content.SkillItem item = new Content.SkillItem();
            item.setName(str(row, "name"));
            item.setIcon(str(row, "icon"));
            item.setLevel(toInt(row, "level", 60));
            skillMap.computeIfAbsent(toLong(row, "groupId"), key -> new ArrayList<>()).add(item);
        }
        List<Content.SkillGroup> groups = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectSkillGroups()) {
            Content.SkillGroup group = new Content.SkillGroup();
            group.setGroup(str(row, "group"));
            group.setDesc(str(row, "desc"));
            group.setItems(skillMap.getOrDefault(toLong(row, "id"), new ArrayList<>()));
            groups.add(group);
        }
        content.setSkillGroups(groups);

        // 项目：四张子表按 projectId 归拢
        Map<Long, List<String>> tags = groupStrings(mapper.selectProjectTags(), "projectId", "tag");
        Map<Long, List<Content.ProjectLink>> links = new LinkedHashMap<>();
        for (Map<String, Object> row : mapper.selectProjectLinks()) {
            Content.ProjectLink link = new Content.ProjectLink();
            link.setLabel(str(row, "label"));
            link.setHref(str(row, "href"));
            links.computeIfAbsent(toLong(row, "projectId"), key -> new ArrayList<>()).add(link);
        }
        Map<Long, List<String>> steps = groupStrings(mapper.selectProjectSteps(), "projectId", "content");
        Map<Long, List<Content.Challenge>> challenges = new LinkedHashMap<>();
        for (Map<String, Object> row : mapper.selectProjectChallenges()) {
            Content.Challenge challenge = new Content.Challenge();
            challenge.setTitle(str(row, "title"));
            challenge.setDetail(str(row, "detail"));
            challenges.computeIfAbsent(toLong(row, "projectId"), key -> new ArrayList<>()).add(challenge);
        }

        List<Content.Project> projects = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectProjects()) {
            long id = toLong(row, "id");
            Content.Project project = new Content.Project();
            project.setSlug(str(row, "slug"));
            project.setTitle(str(row, "title"));
            project.setSummary(str(row, "summary"));
            project.setYear(str(row, "year"));
            project.setRole(str(row, "role"));
            project.setCover(str(row, "cover"));
            project.setGlyph(str(row, "glyph"));
            project.setBackground(str(row, "background"));
            project.setOutcome(str(row, "outcome"));
            project.setTags(tags.getOrDefault(id, new ArrayList<>()));
            project.setLinks(links.getOrDefault(id, new ArrayList<>()));
            project.setApproach(steps.getOrDefault(id, new ArrayList<>()));
            project.setChallenges(challenges.getOrDefault(id, new ArrayList<>()));
            projects.add(project);
        }
        content.setProjects(projects);

        Map<Long, List<String>> postTags = groupStrings(mapper.selectPostTags(), "postId", "tag");
        List<Content.Post> posts = new ArrayList<>();
        for (Map<String, Object> row : mapper.selectPosts()) {
            long id = toLong(row, "id");
            Content.Post post = new Content.Post();
            post.setSlug(str(row, "slug"));
            post.setTitle(str(row, "title"));
            post.setDate(str(row, "date"));
            post.setSummary(str(row, "summary"));
            post.setBody(str(row, "body"));
            post.setTags(postTags.getOrDefault(id, new ArrayList<>()));
            posts.add(post);
        }
        content.setPosts(posts);

        return content;
    }

    public boolean isEmpty() {
        return mapper.countProfile() == 0;
    }

    /* ============================ 写 ============================ */

    @Transactional
    public Content saveContent(Content input) {
        Content content = input == null ? new Content() : input;
        Content.Site site = content.getSite() == null ? new Content.Site() : content.getSite();

        clearAll();

        Map<String, Object> profile = new HashMap<>();
        profile.put("name", safe(site.getName()));
        profile.put("role", safe(site.getRole()));
        profile.put("tagline", safe(site.getTagline()));
        profile.put("email", safe(site.getEmail()));
        profile.put("location", safe(site.getLocation()));
        profile.put("avatar", safe(site.getAvatar()));
        profile.put("resumeUrl", safe(site.getResumeUrl()));
        mapper.upsertProfile(profile);

        writeIntros(site.getIntro());
        writeFacts(site.getFacts());
        writeSocials(site.getSocials());
        writeNavs(site.getNav());
        writeTimeline(site.getTimeline());
        writeSkillGroups(content.getSkillGroups());
        writeProjects(content.getProjects());
        writePosts(content.getPosts());

        String updatedAt = LocalDateTime.now().format(TIME_FMT);
        mapper.upsertMeta("updatedAt", updatedAt);
        mapper.upsertMeta("version", "1");

        return readContent();
    }

    private void clearAll() {
        // 先删子表再删主表，即使没有级联也不会因外键约束失败
        mapper.deleteAllIntro();
        mapper.deleteAllFacts();
        mapper.deleteAllSocials();
        mapper.deleteAllNavs();
        mapper.deleteAllTimelines();
        mapper.deleteAllSkillItems();
        mapper.deleteAllSkillGroups();
        mapper.deleteAllProjectTags();
        mapper.deleteAllProjectLinks();
        mapper.deleteAllProjectSteps();
        mapper.deleteAllProjectChallenges();
        mapper.deleteAllProjects();
        mapper.deleteAllPostTags();
        mapper.deleteAllPosts();
    }

    private void writeIntros(List<String> intro) {
        if (intro == null) return;
        for (int i = 0; i < intro.size(); i++) {
            mapper.insertIntro(i, safe(intro.get(i)));
        }
    }

    private void writeFacts(List<Content.Fact> facts) {
        if (facts == null) return;
        for (int i = 0; i < facts.size(); i++) {
            Content.Fact fact = facts.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("label", safe(fact.getLabel()));
            row.put("value", safe(fact.getValue()));
            mapper.insertFact(row);
        }
    }

    private void writeSocials(List<Content.Social> socials) {
        if (socials == null) return;
        for (int i = 0; i < socials.size(); i++) {
            Content.Social social = socials.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("label", safe(social.getLabel()));
            row.put("href", safe(social.getHref()));
            row.put("icon", safe(social.getIcon()).isEmpty() ? "link" : social.getIcon());
            mapper.insertSocial(row);
        }
    }

    private void writeNavs(List<Content.NavItem> navs) {
        if (navs == null) return;
        for (int i = 0; i < navs.size(); i++) {
            Content.NavItem nav = navs.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("label", safe(nav.getLabel()));
            row.put("anchor", blankToNull(nav.getId()));
            row.put("path", blankToNull(nav.getTo()));
            mapper.insertNav(row);
        }
    }

    private void writeTimeline(List<Content.TimelineItem> timeline) {
        if (timeline == null) return;
        for (int i = 0; i < timeline.size(); i++) {
            Content.TimelineItem item = timeline.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("period", safe(item.getPeriod()));
            row.put("title", safe(item.getTitle()));
            row.put("org", safe(item.getOrg()));
            row.put("descr", safe(item.getDesc()));
            mapper.insertTimeline(row);
        }
    }

    private void writeSkillGroups(List<Content.SkillGroup> groups) {
        if (groups == null) return;
        for (int i = 0; i < groups.size(); i++) {
            Content.SkillGroup group = groups.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("title", safe(group.getGroup()));
            row.put("descr", safe(group.getDesc()));
            mapper.insertSkillGroup(row);
            long groupId = toLong(row, "id");

            List<Content.SkillItem> items = group.getItems();
            if (items == null) continue;
            for (int j = 0; j < items.size(); j++) {
                Content.SkillItem item = items.get(j);
                Map<String, Object> skill = new HashMap<>();
                skill.put("groupId", groupId);
                skill.put("sortNo", j);
                skill.put("name", safe(item.getName()));
                skill.put("icon", safe(item.getIcon()));
                skill.put("level", Math.max(0, Math.min(100, item.getLevel())));
                mapper.insertSkillItem(skill);
            }
        }
    }

    private void writeProjects(List<Content.Project> projects) {
        if (projects == null) return;
        for (int i = 0; i < projects.size(); i++) {
            Content.Project project = projects.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("slug", safe(project.getSlug()).isEmpty() ? "project-" + (i + 1) : project.getSlug());
            row.put("title", safe(project.getTitle()));
            row.put("summary", safe(project.getSummary()));
            row.put("projectYear", safe(project.getYear()));
            row.put("role", safe(project.getRole()));
            row.put("cover", safe(project.getCover()));
            row.put("glyph", safe(project.getGlyph()));
            row.put("background", safe(project.getBackground()));
            row.put("outcome", safe(project.getOutcome()));
            mapper.insertProject(row);
            long projectId = toLong(row, "id");

            if (project.getTags() != null) {
                for (int j = 0; j < project.getTags().size(); j++) {
                    Map<String, Object> tag = new HashMap<>();
                    tag.put("projectId", projectId);
                    tag.put("sortNo", j);
                    tag.put("tag", safe(project.getTags().get(j)));
                    mapper.insertProjectTag(tag);
                }
            }
            if (project.getLinks() != null) {
                for (int j = 0; j < project.getLinks().size(); j++) {
                    Content.ProjectLink link = project.getLinks().get(j);
                    Map<String, Object> row2 = new HashMap<>();
                    row2.put("projectId", projectId);
                    row2.put("sortNo", j);
                    row2.put("label", safe(link.getLabel()));
                    row2.put("href", safe(link.getHref()));
                    mapper.insertProjectLink(row2);
                }
            }
            if (project.getApproach() != null) {
                for (int j = 0; j < project.getApproach().size(); j++) {
                    Map<String, Object> row3 = new HashMap<>();
                    row3.put("projectId", projectId);
                    row3.put("sortNo", j);
                    row3.put("content", safe(project.getApproach().get(j)));
                    mapper.insertProjectStep(row3);
                }
            }
            if (project.getChallenges() != null) {
                for (int j = 0; j < project.getChallenges().size(); j++) {
                    Content.Challenge challenge = project.getChallenges().get(j);
                    Map<String, Object> row4 = new HashMap<>();
                    row4.put("projectId", projectId);
                    row4.put("sortNo", j);
                    row4.put("title", safe(challenge.getTitle()));
                    row4.put("detail", safe(challenge.getDetail()));
                    mapper.insertProjectChallenge(row4);
                }
            }
        }
    }

    private void writePosts(List<Content.Post> posts) {
        if (posts == null) return;
        for (int i = 0; i < posts.size(); i++) {
            Content.Post post = posts.get(i);
            Map<String, Object> row = new HashMap<>();
            row.put("sortNo", i);
            row.put("slug", safe(post.getSlug()).isEmpty() ? "post-" + (i + 1) : post.getSlug());
            row.put("title", safe(post.getTitle()));
            row.put("publishDate", safe(post.getDate()));
            row.put("summary", safe(post.getSummary()));
            row.put("body", safe(post.getBody()));
            mapper.insertPost(row);
            long postId = toLong(row, "id");

            if (post.getTags() != null) {
                for (int j = 0; j < post.getTags().size(); j++) {
                    Map<String, Object> tag = new HashMap<>();
                    tag.put("postId", postId);
                    tag.put("sortNo", j);
                    tag.put("tag", safe(post.getTags().get(j)));
                    mapper.insertPostTag(tag);
                }
            }
        }
    }

    /* ============================ 工具 ============================ */

    private static Map<Long, List<String>> groupStrings(List<Map<String, Object>> rows, String idKey, String valueKey) {
        Map<Long, List<String>> result = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            result.computeIfAbsent(toLong(row, idKey), key -> new ArrayList<>()).add(str(row, valueKey));
        }
        return result;
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    /** Map 的 key 大小写在不同驱动/版本下可能不一致，取值时忽略大小写 */
    private static Object pick(Map<String, Object> row, String key) {
        if (row == null) return null;
        if (row.containsKey(key)) return row.get(key);
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(key)) return entry.getValue();
        }
        return null;
    }

    private static String str(Map<String, Object> row, String key) {
        Object value = pick(row, key);
        return value == null ? "" : String.valueOf(value);
    }

    private static long toLong(Map<String, Object> row, String key) {
        Object value = pick(row, key);
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private static int toInt(Map<String, Object> row, String key, int fallback) {
        Object value = pick(row, key);
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return fallback;
        }
    }
}

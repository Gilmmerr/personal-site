package com.gilmmerr.site.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 内容表的读写。
 *
 * <p>查询统一返回 Map（列别名即 key），因为这里的表都是「一主多从」的展示型结构，
 * 逐张表建实体类反而增加维护成本；写入用 Map 传参，配合 useGeneratedKeys 回填自增 id。</p>
 */
@Mapper
public interface ContentMapper {

    /* ---------------- 读 ---------------- */

    Map<String, Object> selectProfile();

    List<String> selectIntroTexts();

    List<Map<String, Object>> selectFacts();

    List<Map<String, Object>> selectSocials();

    List<Map<String, Object>> selectNavs();

    List<Map<String, Object>> selectTimelines();

    List<Map<String, Object>> selectSkillGroups();

    List<Map<String, Object>> selectSkillItems();

    List<Map<String, Object>> selectProjects();

    List<Map<String, Object>> selectProjectTags();

    List<Map<String, Object>> selectProjectLinks();

    List<Map<String, Object>> selectProjectSteps();

    List<Map<String, Object>> selectProjectChallenges();

    List<Map<String, Object>> selectPosts();

    List<Map<String, Object>> selectPostTags();

    String selectMeta(@Param("k") String key);

    int countProfile();

    /* ---------------- 写（整体覆盖） ---------------- */

    int upsertProfile(Map<String, Object> row);

    int upsertMeta(@Param("k") String key, @Param("v") String value);

    void deleteAllIntro();

    void deleteAllFacts();

    void deleteAllSocials();

    void deleteAllNavs();

    void deleteAllTimelines();

    void deleteAllSkillGroups();

    void deleteAllSkillItems();

    void deleteAllProjects();

    void deleteAllProjectTags();

    void deleteAllProjectLinks();

    void deleteAllProjectSteps();

    void deleteAllProjectChallenges();

    void deleteAllPosts();

    void deleteAllPostTags();

    void insertIntro(@Param("sortNo") int sortNo, @Param("content") String content);

    void insertFact(Map<String, Object> row);

    void insertSocial(Map<String, Object> row);

    void insertNav(Map<String, Object> row);

    void insertTimeline(Map<String, Object> row);

    void insertSkillGroup(Map<String, Object> row);

    void insertSkillItem(Map<String, Object> row);

    void insertProject(Map<String, Object> row);

    void insertProjectTag(Map<String, Object> row);

    void insertProjectLink(Map<String, Object> row);

    void insertProjectStep(Map<String, Object> row);

    void insertProjectChallenge(Map<String, Object> row);

    void insertPost(Map<String, Object> row);

    void insertPostTag(Map<String, Object> row);
}

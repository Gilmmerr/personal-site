-- ============================================================
-- 个人站点内容库
-- 用法：mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS personal_site
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE personal_site;

-- 站点基本信息：全站只有一行，id 固定为 1
CREATE TABLE IF NOT EXISTS site_profile (
  id          TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  name        VARCHAR(64)      NOT NULL DEFAULT '',
  role        VARCHAR(128)     NOT NULL DEFAULT '',
  tagline     VARCHAR(255)     NOT NULL DEFAULT '',
  email       VARCHAR(128)     NOT NULL DEFAULT '',
  location    VARCHAR(128)     NOT NULL DEFAULT '',
  avatar      VARCHAR(255)     NOT NULL DEFAULT '',
  resume_url  VARCHAR(255)     NOT NULL DEFAULT '',
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '站点基本信息';

-- 首屏下面的三段自我介绍，按 sort_no 排序
CREATE TABLE IF NOT EXISTS site_intro (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  content  TEXT         NOT NULL,
  KEY idx_intro_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '自我介绍段落';

-- 关于区块右侧的信息卡
CREATE TABLE IF NOT EXISTS site_fact (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  label    VARCHAR(64)  NOT NULL DEFAULT '',
  value    VARCHAR(255) NOT NULL DEFAULT '',
  KEY idx_fact_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '信息卡';

-- 社交链接
CREATE TABLE IF NOT EXISTS site_social (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  label    VARCHAR(64)  NOT NULL DEFAULT '',
  href     VARCHAR(255) NOT NULL DEFAULT '',
  icon     VARCHAR(32)  NOT NULL DEFAULT 'link',
  KEY idx_social_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '社交链接';

-- 顶部导航；id 对应首页锚点，to 对应路由，两者只会有一个有值
CREATE TABLE IF NOT EXISTS site_nav (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  label    VARCHAR(64)  NOT NULL DEFAULT '',
  anchor   VARCHAR(64)  NULL,
  path     VARCHAR(128) NULL,
  KEY idx_nav_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '顶部导航';

-- 经历时间线
CREATE TABLE IF NOT EXISTS timeline_item (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  period   VARCHAR(64)  NOT NULL DEFAULT '',
  title    VARCHAR(128) NOT NULL DEFAULT '',
  org      VARCHAR(128) NOT NULL DEFAULT '',
  descr    VARCHAR(500) NOT NULL DEFAULT '',
  KEY idx_timeline_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '经历时间线';

-- 技能分组
CREATE TABLE IF NOT EXISTS skill_group (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no  INT          NOT NULL DEFAULT 0,
  title    VARCHAR(64)  NOT NULL DEFAULT '',
  descr    VARCHAR(255) NOT NULL DEFAULT '',
  KEY idx_skill_group_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '技能分组';

-- 单个技能，level 为 0~100 的熟练度
CREATE TABLE IF NOT EXISTS skill_item (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  group_id  INT UNSIGNED NOT NULL,
  sort_no   INT          NOT NULL DEFAULT 0,
  name      VARCHAR(64)  NOT NULL DEFAULT '',
  icon      VARCHAR(32)  NOT NULL DEFAULT '',
  level     TINYINT UNSIGNED NOT NULL DEFAULT 60,
  KEY idx_skill_group (group_id, sort_no),
  CONSTRAINT fk_skill_group FOREIGN KEY (group_id) REFERENCES skill_group (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '技能';

-- 项目主表
CREATE TABLE IF NOT EXISTS project (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no     INT          NOT NULL DEFAULT 0,
  slug        VARCHAR(64)  NOT NULL,
  title       VARCHAR(128) NOT NULL DEFAULT '',
  summary     VARCHAR(500) NOT NULL DEFAULT '',
  project_year VARCHAR(32) NOT NULL DEFAULT '',
  role        VARCHAR(255) NOT NULL DEFAULT '',
  cover       VARCHAR(255) NOT NULL DEFAULT '',
  glyph       VARCHAR(16)  NOT NULL DEFAULT '',
  background  TEXT         NULL,
  outcome     TEXT         NULL,
  UNIQUE KEY uk_project_slug (slug),
  KEY idx_project_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '项目';

-- 项目标签
CREATE TABLE IF NOT EXISTS project_tag (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  sort_no    INT          NOT NULL DEFAULT 0,
  tag        VARCHAR(64)  NOT NULL DEFAULT '',
  KEY idx_project_tag (project_id, sort_no),
  CONSTRAINT fk_project_tag FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '项目标签';

-- 项目外链
CREATE TABLE IF NOT EXISTS project_link (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  sort_no    INT          NOT NULL DEFAULT 0,
  label      VARCHAR(64)  NOT NULL DEFAULT '',
  href       VARCHAR(255) NOT NULL DEFAULT '',
  KEY idx_project_link (project_id, sort_no),
  CONSTRAINT fk_project_link FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '项目外链';

-- 项目实现步骤（前端字段 approach）
CREATE TABLE IF NOT EXISTS project_step (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  sort_no    INT          NOT NULL DEFAULT 0,
  content    VARCHAR(500) NOT NULL DEFAULT '',
  KEY idx_project_step (project_id, sort_no),
  CONSTRAINT fk_project_step FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '项目实现步骤';

-- 项目难点
CREATE TABLE IF NOT EXISTS project_challenge (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  sort_no    INT          NOT NULL DEFAULT 0,
  title      VARCHAR(128) NOT NULL DEFAULT '',
  detail     VARCHAR(500) NOT NULL DEFAULT '',
  KEY idx_project_challenge (project_id, sort_no),
  CONSTRAINT fk_project_challenge FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '项目难点';

-- 博客文章
CREATE TABLE IF NOT EXISTS post (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_no      INT          NOT NULL DEFAULT 0,
  slug         VARCHAR(64)  NOT NULL,
  title        VARCHAR(128) NOT NULL DEFAULT '',
  publish_date VARCHAR(32)  NOT NULL DEFAULT '',
  summary      VARCHAR(500) NOT NULL DEFAULT '',
  body         MEDIUMTEXT   NULL,
  UNIQUE KEY uk_post_slug (slug),
  KEY idx_post_sort (sort_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '博客文章';

-- 文章标签
CREATE TABLE IF NOT EXISTS post_tag (
  id      INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id INT UNSIGNED NOT NULL,
  sort_no INT          NOT NULL DEFAULT 0,
  tag     VARCHAR(64)  NOT NULL DEFAULT '',
  KEY idx_post_tag (post_id, sort_no),
  CONSTRAINT fk_post_tag FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '文章标签';

-- 内容版本信息
CREATE TABLE IF NOT EXISTS site_meta (
  k VARCHAR(64) NOT NULL PRIMARY KEY,
  v TEXT        NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '内容元信息';

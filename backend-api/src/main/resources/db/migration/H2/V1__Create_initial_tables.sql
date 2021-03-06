CREATE TABLE access_log (
  access_log_id  VARCHAR(36)  NOT NULL,
  access_date    TIMESTAMP,
  method         VARCHAR(10)  NOT NULL,
  query          VARCHAR(128),
  remote_address VARCHAR(128) NOT NULL,
  uri            VARCHAR(128) NOT NULL,
  user_agent     VARCHAR(128) NOT NULL,
  x_track        VARCHAR(32),
  PRIMARY KEY (access_log_id)
);

CREATE TABLE category (
  category_order INTEGER      NOT NULL,
  entry_id       INTEGER      NOT NULL,
  category_name  VARCHAR(128) NOT NULL,
  PRIMARY KEY (category_order, entry_id)
);

CREATE TABLE entry (
  entry_id           INTEGER generated BY DEFAULT AS IDENTITY,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  contents           VARCHAR(65536) NOT NULL,
  format             VARCHAR(10)    NOT NULL,
  published          BOOLEAN        NOT NULL,
  title              VARCHAR(512)   NOT NULL,
  PRIMARY KEY (entry_id)
);

CREATE TABLE entry_history (
  entry_histry_id    VARCHAR(36)    NOT NULL,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  contents           VARCHAR(65536) NOT NULL,
  format             VARCHAR(10)    NOT NULL,
  title              VARCHAR(512)   NOT NULL,
  entry_id           INTEGER        NOT NULL,
  PRIMARY KEY (entry_histry_id)
);

CREATE TABLE link (
  url                VARCHAR(128) NOT NULL,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  link_name          VARCHAR(128) NOT NULL,
  PRIMARY KEY (url)
);

CREATE TABLE login_history (
  login_history_id VARCHAR(36)  NOT NULL,
  login_agent      VARCHAR(128) NOT NULL,
  login_date       TIMESTAMP    NOT NULL,
  login_host       VARCHAR(128) NOT NULL,
  username         VARCHAR(128) NOT NULL,
  PRIMARY KEY (login_history_id)
);

CREATE TABLE role (
  role_id            INTEGER generated BY DEFAULT AS IDENTITY,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  role_name          VARCHAR(25) NOT NULL,
  PRIMARY KEY (role_id)
);

CREATE TABLE upload_file (
  file_id            VARCHAR(36) NOT NULL,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  file_content       BLOB,
  file_name          VARCHAR(255),
  PRIMARY KEY (file_id)
);

CREATE TABLE user (
  username           VARCHAR(255) NOT NULL,
  version            BIGINT,
  created_by         VARCHAR(128),
  created_date       TIMESTAMP,
  last_modified_by   VARCHAR(128),
  last_modified_date TIMESTAMP,
  email              VARCHAR(128) NOT NULL,
  enabled            BOOLEAN      NOT NULL,
  first_name         VARCHAR(128) NOT NULL,
  last_name          VARCHAR(128) NOT NULL,
  locked             BOOLEAN      NOT NULL,
  password           VARCHAR(256) NOT NULL,
  PRIMARY KEY (username)
);

CREATE TABLE user_role (
  username VARCHAR(255) NOT NULL,
  role_id  INTEGER      NOT NULL,
  PRIMARY KEY (username, role_id)
);

CREATE INDEX UK_yj8qxec5iw5prreilrw5uojs ON access_log (method);

CREATE INDEX UK_61mv3850375ocbci95horak6f ON access_log (uri);

CREATE INDEX UK_3npv4tqwmeri5o9rrx5tob054 ON access_log (remote_address);

CREATE INDEX UK_ikrhoc5rey94top5qv9lleo3k ON access_log (x_track);

CREATE INDEX UK_imw5hl7fsuv7p4ojvd2ngwrr6 ON access_log (access_date);

CREATE INDEX UK_lroeo5fvfdeg4hpicn4lw7x9b ON category (category_name);

CREATE INDEX UK_h89shgwewnwgby2u10ludyqnq ON entry (last_modified_date);

CREATE INDEX UK_jje1bkbmu5eyx0yebiprac8e ON entry (created_by);

CREATE INDEX UK_cpj76n28t4naq74hvp6afb3dm ON entry_history (last_modified_date);

CREATE INDEX UK_ctq5stwm9s6pfyiiirsvhfbph ON link (last_modified_date);

CREATE INDEX UK_5mvyukln9xc3gdsetytdwxihi ON login_history (login_date);

ALTER TABLE role
ADD CONSTRAINT UK_iubw515ff0ugtm28p8g3myt0h UNIQUE (role_name);

CREATE INDEX UK_cp5402wudt8t9t71vu303f0ge ON upload_file (last_modified_date);

CREATE INDEX UK_bhd2crxuienxl2fhijgb7oodh ON user (last_modified_date);

ALTER TABLE category
ADD CONSTRAINT FK_ihjisvvo7d8b0vu26asrl0d3a
FOREIGN KEY (entry_id)
REFERENCES entry;

ALTER TABLE entry_history
ADD CONSTRAINT FK_f2mu7h50hhd8dmrkyb01jpch8
FOREIGN KEY (entry_id)
REFERENCES entry;

ALTER TABLE user_role
ADD CONSTRAINT FK_it77eq964jhfqtu54081ebtio
FOREIGN KEY (role_id)
REFERENCES role;

ALTER TABLE user_role
ADD CONSTRAINT FK_aphxiciwirrvuc0y7y2s2rufj
FOREIGN KEY (username)
REFERENCES user;

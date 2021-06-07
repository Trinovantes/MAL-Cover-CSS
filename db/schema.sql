CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(255) primary key);
CREATE TABLE `Users` (
    `id`            INTEGER         NOT NULL,
    `malUsername`   TEXT            NOT NULL,
    `malUserId`     INTEGER         NOT NULL UNIQUE,
    `lastChecked`   DATETIME,
    `tokenExpires`  DATETIME,
    `accessToken`   TEXT,
    `refreshToken`  TEXT,
    `createdAt`     DATETIME        NOT NULL,
    `updatedAt`     DATETIME        NOT NULL,

    PRIMARY KEY (`id`)
);
CREATE TABLE `ItemType` (
    `itemType`      VARCHAR(10)     NOT NULL,
    `sequence`      INTEGER         NOT NULL,

    PRIMARY KEY (`itemType`)
);
CREATE TABLE `Items` (
    `id`            INTEGER         NOT NULL,
    `mediaType`     TEXT            NOT NULL REFERENCES ItemType(itemType),
    `malId`         INTEGER         NOT NULL,
    `imgUrl`        TEXT,
    `createdAt`     DATETIME        NOT NULL,
    `updatedAt`     DATETIME        NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT unique_item UNIQUE (`mediaType`, `malId`)
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('0001');

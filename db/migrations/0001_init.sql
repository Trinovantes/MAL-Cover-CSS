-- migrate:up

CREATE TABLE IF NOT EXISTS `Users` (
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

INSERT INTO ItemType(itemType, sequence) VALUES ('anime', 1);
INSERT INTO ItemType(itemType, sequence) VALUES ('manga', 2);

CREATE TABLE IF NOT EXISTS `Items` (
    `id`            INTEGER         NOT NULL,
    `mediaType`     TEXT            NOT NULL REFERENCES ItemType(itemType),
    `malId`         INTEGER         NOT NULL,
    `imgUrl`        TEXT,
    `createdAt`     DATETIME        NOT NULL,
    `updatedAt`     DATETIME        NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT unique_item UNIQUE (`mediaType`, `malId`)
);

-- migrate:down

DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Items`;

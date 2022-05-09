-- migrate:up

ALTER TABLE `Users` RENAME TO `User`;
ALTER TABLE `Items` RENAME TO `Item`;

-- migrate:down

ALTER TABLE `User` RENAME TO `Users`;
ALTER TABLE `Item` RENAME TO `Items`;

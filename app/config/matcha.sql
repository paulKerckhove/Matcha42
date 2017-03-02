CREATE DATABASE IF NOT EXISTS matcha;

USE pkerckho_matcha;

CREATE TABLE IF NOT EXISTS usersmain (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    email varchar(255) NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    activated enum('0', '1') NOT NULL DEFAULT '0',
    UNIQUE KEY username (username,email)
);

CREATE TABLE IF NOT EXISTS usersinfo (
    id int(11) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    username varchar(16) NOT NULL,
    age int(3) NOT NULL,
    sex enum ('m', 'f', 'u') NOT NULL DEFAULT 'u',
    orientation enum ('s', 'g', 'b', 'u') NOT NULL DEFAULT 'u',
    bio varchar(300) NULL,
    token varchar(255) NULL,
    likes int(11) NOT NULL DEFAULT '0',
    popularity int(11) NOT NULL DEFAULT '0',
    lastlogin DATETIME NOT NULL,
    visits int(11) NOT NULL DEFAULT '0',
    signup DATETIME NOT NULL,
    notescheck DATETIME NOT NULL,
    email varchar(255) NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    UNIQUE KEY username (username)
);

CREATE TABLE IF NOT EXISTS userlocation (
  id int (11) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
  username varchar(16) NOT NULL,
  latitude float(32) NOT NULL,
  longitude float(32) NOT NULL,
  country varchar(255),
  city varchar(255),
  zipcode int(32)
)

CREATE TABLE IF not EXISTS usertags (
  username varchar(36) NOT NULL,
  id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
  tag_id int(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    tags varchar(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_tags (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    user_id int(32),
    tag_id int(32)
);

CREATE TABLE IF NOT EXISTS photos (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    username varchar(255) NOT NULL,
    new_path varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    username varchar(255) NOT NULL,
    liked varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    user_1 varchar(36) NOT NULL,
    user_2 varchar(36) NOT NULL
);

CREATE TABLE IF NOT EXISTS chatMessages (
    id int(32) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    username varchar(36) NOT NULL,
    msg text NOT NULL,
    date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id int(32) NOT NULL,
    user varchar(36) NOT NULL,
    reported varchar(36) NOT NULL,
    type enum('FAKE', 'SPAM', 'INAPPROPRIATE') NOT NULL
);

CREATE TABLE IF NOT EXISTS blockedusers (
    id int(11) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
    blocker varchar(16) NOT NULL,
    blocked varchar(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_alerts (
    id int(32) NOT NULL,
    user varchar(36) NOT NULL,
    msg text NOT NULL,
    date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shown tinyint(1) NOT NULL DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS userMatchs (
    id varchar(36) NOT NULL,
    username varchar(36) NOT NULL,
    matched varchar(36) NOT NULL,
    date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mutual tinyint(1) NOT NULL DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS visits (
    user varchar(36) NOT NULL,
    visited varchar(36) NOT NULL,
    date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

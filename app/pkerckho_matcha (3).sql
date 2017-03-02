-- phpMyAdmin SQL Dump
-- version 4.0.10.6
-- http://www.phpmyadmin.net
--
-- Host: mysql1.alwaysdata.com
-- Generation Time: Feb 10, 2017 at 06:30 PM
-- Server version: 5.1.66-0+squeeze1
-- PHP Version: 5.6.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `pkerckho_matcha`
--

-- --------------------------------------------------------

--
-- Table structure for table `blocked`
--

CREATE TABLE IF NOT EXISTS `blocked` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blocker` varchar(16) NOT NULL,
  `blocked` varchar(16) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE IF NOT EXISTS `chat` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `username` varchar(36) NOT NULL,
  `user_2` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `seen1` tinyint(4) DEFAULT NULL,
  `seen2` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE IF NOT EXISTS `likes` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `user_dest` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `matchs`
--

CREATE TABLE IF NOT EXISTS `matchs` (
  `id` varchar(36) NOT NULL AUTO_INCREMENT,
  `username` varchar(36) NOT NULL,
  `user_dest` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `user` varchar(36) NOT NULL,
  `user_dest` varchar(36) NOT NULL,
  `id_notif` int(11) NOT NULL,
  `seen` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `notification_type`
--

CREATE TABLE IF NOT EXISTS `notification_type` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `description` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notification_type`
--

INSERT INTO `notification_type` (`id`, `description`) VALUES
(1, 'online'),
(2, 'like'),
(3, 'unlike'),
(4, 'match'),
(5, 'visit'),
(6, 'chat');

-- --------------------------------------------------------

--
-- Table structure for table `photos`
--

CREATE TABLE IF NOT EXISTS `photos` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `new_path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=83 ;

--
-- Dumping data for table `photos`
--

INSERT INTO `photos` (`id`, `username`, `new_path`) VALUES
(78, 'pablito', '1480417792630.pablito.png'),
(79, 'pablito', '1480501591985.pablito.png'),
(81, 'natedogg', '1481640456051.natedogg.jpg'),
(82, 'natedogg', '1486655771055.natedogg.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(32) NOT NULL,
  `user` varchar(36) NOT NULL,
  `reported` varchar(36) NOT NULL,
  `type` enum('FAKE','SPAM','INAPPROPRIATE') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `tags` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=177 ;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `tags`) VALUES
(1, 'myfirstTag'),
(4, 'Provemwrong'),
(31, 'djpremier'),
(169, 'west-coast'),
(170, 'hoes'),
(171, 'pimpin'),
(172, 'daftpunk'),
(173, 'NTM'),
(174, 'sport'),
(175, 'WOW'),
(176, 'lildicks');

-- --------------------------------------------------------

--
-- Table structure for table `userlocation`
--

CREATE TABLE IF NOT EXISTS `userlocation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zipcode` int(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=39 ;

--
-- Dumping data for table `userlocation`
--

INSERT INTO `userlocation` (`id`, `username`, `latitude`, `longitude`, `country`, `city`, `zipcode`) VALUES
(33, 'pablito', 48.8921, 2.31922, 'France', 'Paris', 75017),
(34, 'natedogg', 48.8856, 2.26545, 'France', 'Neuilly-sur-Seine', 92200),
(35, 'tupac', 48.8534, 2.3488, 'France', 'Paris', 75017),
(36, 'lildicky', 45.75, 4.85, 'France', 'Lyon', 69001),
(37, 'test1', 48.8569, 2.3488, 'France', 'Paris', 75017),
(38, 'test2', 48.8534, 2.3488, 'France', 'Paris', 75017);

-- --------------------------------------------------------

--
-- Table structure for table `usersinfo`
--

CREATE TABLE IF NOT EXISTS `usersinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `age` int(3) NOT NULL,
  `sex` enum('m','f','u') NOT NULL DEFAULT 'u',
  `orientation` enum('s','g','b','u') NOT NULL DEFAULT 'u',
  `bio` varchar(300) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT '0',
  `popularity` int(11) NOT NULL DEFAULT '0',
  `lastlogin` datetime NOT NULL,
  `visits` int(11) NOT NULL DEFAULT '0',
  `signup` datetime NOT NULL,
  `notescheck` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=27 ;

--
-- Dumping data for table `usersinfo`
--

INSERT INTO `usersinfo` (`id`, `username`, `age`, `sex`, `orientation`, `bio`, `token`, `likes`, `popularity`, `lastlogin`, `visits`, `signup`, `notescheck`, `email`, `first_name`, `last_name`) VALUES
(1, 'pablito', 50, 'f', 's', 'this is my bio !', NULL, 0, 20, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'paul.kerckhove@gmail.com', 'pablo', 'escobar'),
(7, 'natedogg', 28, 'm', 'b', 'wesh, c''est ma bio a la bien poto', NULL, 0, 10, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'nate@gmail.com', 'nate', 'dogg'),
(23, 'tupac', 20, 'f', 's', 'this is my bio !', NULL, 0, 35, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'tupac@gmail.com', 'tupac', 'shakur'),
(24, 'lildicky', 35, 'f', 's', 'this is my bio !', NULL, 0, 10, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'lildicky@gmail.com', 'lil', 'dicky'),
(25, 'test1', 70, 'f', 's', 'this is my bio !', NULL, 0, 10, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'test1@gmail.com', 'test1', 'test1'),
(26, 'test2', 47, 'm', 'g', 'this is my bio !', NULL, 0, 10, '0000-00-00 00:00:00', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'test2@gmail.com', 'test2', 'test2');

-- --------------------------------------------------------

--
-- Table structure for table `usersmain`
--

CREATE TABLE IF NOT EXISTS `usersmain` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activated` enum('0','1') NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`,`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=27 ;

--
-- Dumping data for table `usersmain`
--

INSERT INTO `usersmain` (`id`, `email`, `first_name`, `last_name`, `username`, `password`, `activated`) VALUES
(1, 'paul.kerckhove@gmail.com', 'pablo', 'escobar', 'pablito', '$2a$10$mIrXu5ea7yBpLC7yp62bNOU3cI4RvJH7FJgevrQbHE3CGH9..cf5u', '0'),
(19, 'nate@gmail.com', 'nate', 'dogg', 'natedogg', '$2a$10$FUORhDHnq1A.wU9ZG3Ny3uRC.ipnp2MehTCI6FMR2QlmZ/0377mJS', '0'),
(23, 'pac@gmail.com', 'tupac', 'shakur', 'tupac', '$2a$10$Wzb30r2irY7MMmmTueDE8uc.NX8dAO67DCALFxh233qfecs7hO2NK', '0'),
(24, 'lildicky@gmail.com', 'lil', 'dicky', 'lildicky', '$2a$10$dmoUXqDE73xI5AWTkvWpauBVriPt1akltwM2.jsksI7oWsMQhFOfy', '0'),
(25, 'test1@gmail.com', 'test1', 'test1', 'test1', '$2a$10$HXFlR7Pb1sBcVZsPHjsUs.YxzM7GuIMSLMOIO0i52.z4BfT/x/1Ae', '0'),
(26, 'test2@gmail.com', 'test2', 'test2', 'test2', '$2a$10$t7K.TVAd07VYuchlTxut8eZWi6eHsjSObJjJzp1ZnlMEEGzN5hJ9u', '0');

-- --------------------------------------------------------

--
-- Table structure for table `user_tags`
--

CREATE TABLE IF NOT EXISTS `user_tags` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `tag_id` int(32) DEFAULT NULL,
  `username` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tag_id` (`tag_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=172 ;

--
-- Dumping data for table `user_tags`
--

INSERT INTO `user_tags` (`id`, `tag_id`, `username`) VALUES
(158, 170, 'natedogg'),
(159, 171, 'natedogg'),
(160, 169, 'natedogg'),
(161, 174, 'pablito'),
(162, 173, 'tupac'),
(164, 172, 'pablito'),
(165, 172, 'natedogg'),
(166, 172, 'tupac'),
(167, 172, 'lildicky'),
(168, 176, 'lildicky'),
(169, 175, 'lildicky'),
(170, 172, 'test1'),
(171, 172, 'test2');

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

CREATE TABLE IF NOT EXISTS `visits` (
  `user` varchar(36) NOT NULL,
  `visited` varchar(36) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_tags`
--
ALTER TABLE `user_tags`
  ADD CONSTRAINT `user_tags_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

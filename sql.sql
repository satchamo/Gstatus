CREATE DATABASE `IpQueue`;

CREATE TABLE  `IpQueue`.`Money` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `website` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `amount_on` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE  `IpQueue`.`Visitors` (
  `ip_address` varchar(16) NOT NULL,
  `last_visit` datetime NOT NULL,
  `website` varchar(50) NOT NULL,
  `lat` float NOT NULL,
  `long` float NOT NULL,
  PRIMARY KEY (`ip_address`,`website`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

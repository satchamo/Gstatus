Summary
=
Gstatus displays the latest visitors to your websites on top of a Google Map, the date and time, and how much money you have made on your websites.

Requirements and Dependencies 
=
* Python - 2.6.5 (probably works on 2.5.x)
* PHP - 5.x (probably works on 4.x) 
* GeoIP for Python (which itself requires the C bindings) - `apt-get install python-geoip` should cover it
* GeoIP City Database - http://geolite.maxmind.com/download/geoip/database/ (called 'GeoLiteCity.dat.gz' -- be sure to gunzip it)
* MySQL - 4 or 5
* Google Maps API key - http://code.google.com/apis/maps/documentation/javascript/tutorial.html#Obtaining_Key

How It Works
=
A python script sits and waits for incoming data sent over TCP. The data either represents a website visitor, or the money a website just made.
For example, this data packet would indicate a person at IP 1.1.1.1 just visited example.com:

    1.1.1.1 example.com\n

and this would indicate example.com just made $25.10:

    money example.com 25.10\n

The python script parses the information, and in the case of a visitor--identifies the visitor's location using GeoIP--and inserts the data into a database. 
The index.html polls the update.php page roughly every second, and the update.php pulls the latest data from the database.

The visitors are plotted as little dots on a Google Map, and the daily totals for the websites are tabulated on the side.

After you get it working, it looks pretty cool.

Setup
=
Database
-
Create a database called IpQueue:

    CREATE DATABASE `IpQueue`;

Create two tables in the database:

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

GeoIP
-
gunzip the GeoLiteCity.dat.gz file and move it to a place where this program can access it (/usr/share/GeoIP for example)

listen.py
-
Change the first few lines of listen.py to match your database host/username/password and location of your GeoLiteCity.dat file. Also change the LISTEN_ON ip address to match that of your computer.

If you are running listen.py on a computer behind a router or firewall, make sure you open up port 8001, and/or forward it to your computer.

update.php
-
Change the first lines to match your database host/username/password.

js/config.js
-
Add your sites to the configuration, specifying the colors of the dot you want to represent the site, whether you want it to appear on the sidebar where money totals are displayed, and its label.

index.html
-
Replace YOUR_API_KEY with your API key from Google.

Starting the Application
=
Run `python listen.py` (hopefully you won't get any errors)!

Talking to the Application
=
You can use the nc command to send simple messages to the application. Some examples (make sure you replace the IP address after 'nc' to your IP):
    
    echo -e "8.8.8.8 default.com\n" | nc YOUR_IP 8001

If you now open up index.html in your browser, you should see a dot over California.

To send a money message (make sure you replace YOUR-SITE.com with a site listed in js/config.js):

    echo -e "money YOUR-SITE.com 25.10\n" | nc YOUR_IP 8001

index.html should now show that YOUR-SITE.com earned $25.10.

Tips
=
If your website servers run Apache, you can edit the LogFormat to show your website's hostname (which makes it work with this program). In apache.conf, change your LogFormat to have a \"%{Host}i\" at the end:

    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\" \"%{Host}i\"" combined

Then do something like 

    tail --follow=name /var/log/apache2/access.log | nc YOUR_IP 8001

Contact Me
=
This was probably very confusing for you! I'm not a technical writer by trade, so if you need help setting this up, please don't hesitate to email me: matt@satchamo.com


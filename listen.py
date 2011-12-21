#!/usr/bin/env python
import sys
import re
import thread
import socket
import MySQLdb
import GeoIP

DB_HOST = 'localhost'
DB_USERNAME = 'username'
DB_PASSWORD = 'password'

GEO_IP_DATA_FILE = "/usr/share/GeoIP/GeoIPCity.dat"

LISTEN_ON = 'YOUR_IP' # like 192.168.1.5 or 55.55.15.11
DEFAULT_PORT = 8001
BUFFER_SIZE = 4096

MAP_SQL = "INSERT INTO IpQueue.Visitors(ip_address, last_visit, website, lat, `long`) \
VALUES(%s, NOW(), %s, %s, %s) ON DUPLICATE KEY UPDATE last_visit = NOW();"

MONEY_SQL = "INSERT INTO IpQueue.Money(website, amount, amount_on) \
VALUES(%s, %s, NOW());"

def onConnect(client_socket, client_addr):
    print "Accepted connection from: ", client_addr

    conn = MySQLdb.connect(DB_HOST, DB_USERNAME, DB_PASSWORD)
    cursor = conn.cursor()
    gi = GeoIP.open(GEO_IP_DATA_FILE,GeoIP.GEOIP_STANDARD)

    data = ""
    while 1:
        # wait for something to come from the socket
        data += client_socket.recv(BUFFER_SIZE)

        # socket is broken, need to quit
        if data == "":
            break

        # we assume everything is terminated by a newline so if one isn't there
        # we got a fragment (that needs to be prepended to the stream next time 
        # around the loop)
        is_fragment = data[-1] != "\n"

        lines = data.split("\n")
        up_to = len(lines)
        if is_fragment:
            up_to -= 1

        for i in xrange(up_to):
            matches = re.split(r'\s+', lines[i])
            if len(matches) >= 2:
                flag = matches[0]
                if flag == "money":
                    site = matches[1]
                    amount = matches[2]
                    cursor.execute(MONEY_SQL, (site, amount))
                    conn.commit()
                else:
                    ip = flag
                    site = matches[-1].strip('"')
                    site = re.sub(r'^www\.', '', site)
                    gir = gi.record_by_name(ip)
                    if gir == None:
                        continue
                    lat = gir['latitude']
                    lon = gir['longitude']
                    cursor.execute(MAP_SQL, (ip, site, lat, lon))
                    conn.commit()

        if is_fragment:
            # save the last line for the next round
            data = lines[-1]
        else:
            data = ""

        # keep the connection alive
        conn.ping()

    client_socket.close()
    cursor.close()
    conn.close()
    print "Closed connection from ", client_addr


if __name__ == "__main__":
    #host = socket.gethostbyname(socket.gethostname())
    if len(sys.argv) != 2:
        port = DEFAULT_PORT
    else:
        port = int(sys.argv[1])

    # setup the server socket
    host = LISTEN_ON
    addr = (host, port)
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(addr)
    server_socket.listen(2)

    # wait for connections
    try:
        while 1:
            print "Server is listening for connections on %s:%s\n" % (host, port)
            # spawn off a new thread for this connection
            client_socket, client_addr = server_socket.accept()
            thread.start_new_thread(onConnect, (client_socket, client_addr))
    except KeyboardInterrupt:
        print "I was killed by a ^C"

    server_socket.close()

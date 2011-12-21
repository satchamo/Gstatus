<?php
mysql_connect('localhost', 'username', 'password');
mysql_select_db('IpQueue');
$go_back = 5*60; // how far back in time (in seconds) you want to display visitors (ie: 5 minutes)

$query = $_GET['query'];

$sql = array(
    'money' => "SELECT website, SUM(amount) as money FROM Money WHERE LEFT(amount_on, 10) = LEFT(NOW(), 10) GROUP BY website",
    'visitors' => "SELECT * FROM Visitors WHERE last_visit >= (NOW() - $go_back)"
);

$result = mysql_query($sql[$query]);
while($row = mysql_fetch_assoc($result)){
    echo join(",", $row), "\n";
}

<?php
try {
  $db = new PDO("sqlite:/var/www/messagepassing/rooms.sqlite");
} catch (PDOException $e) {
  echo $e->getMessage();
  }

try {
  $result = $db->query("select distinct(roomid) as roomid from rooms order by 1 desc")->fetchall();
} catch(PDOException $e) {
  echo$e->getMessage();
  }

echo "<table id = 'current_rooms'>";
foreach($result as $row) {
  $roomid = $row["roomid"];
  echo "<tr><td><a href = 'accept.html?id=$roomid'>Room $roomid</a></td></tr>";
}
echo "</table>";
$db = null;

?>
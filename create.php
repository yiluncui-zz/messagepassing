
<?php
$host = $_GET["host"];
$fifoid=uniqid("id", true);
posix_mkfifo("/var/run/starchat/$fifoid", 0600) or die("cannot open FIFO");

if(!strcmp($host,"host")) {
  try {
  $db= new PDO("sqlite:/var/www/messagepassing/rooms.sqlite");
  } catch(PDOException $e) {
    echo $e->getMessage();
  }
  try{
    $result = $db->query("select max(roomid) as max from rooms")->fetch(); 

  } catch (PDOException $e) {
    echo $e->getMessage();
  }
  
  if(!$result || count($result) == 0) {
    $newRoomNum = 0;
  } else {
    $newRoomNum = $result["max"]+1;
  }
  $query = "INSERT INTO rooms (roomid,fifoid) VALUES (?,?)";
  
  $stmt = $db->prepare($query);
  $ok = $stmt->execute(array($newRoomNum,$fifoid));
  //echo $ok."<br/>";
  $db = null;
} else { 
  $newRoomNum = -1;
}
echo "$newRoomNum:$fifoid";
?>


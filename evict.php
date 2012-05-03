<?php
$fifoid = $_POST["id"];
echo "hi";
try{
$db= new PDO("sqlite:/var/www/messagepassing/rooms.sqlite");
} catch(PDOException $e) {
  echo $e->getMessage();
  }
try{
  $query = "DELETE FROM rooms WHERE fifoid = '$fifoid'";
  echo $query;
  $stmt = $db->exec($query);
  echo "\n".$stmt."<br/>";
  $db = null;  
} catch (PDOException $e) {
  echo $e->getMessage();
  }
?>
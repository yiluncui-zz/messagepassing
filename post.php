<?php

$roomid    = $_POST["id"];
$msgArray  = array ( "msgBody" => $_POST["msg"] );

if (strpos($roomid, "/")) die("invalid roomid");

$db=new PDO('sqlite:/var/www/messagepassing/rooms.sqlite');

$query = "select fifoid from rooms where roomid = $roomid";
$result = $db->query($query)->fetchall();

foreach($result as $row) {
  //  print_r($row);
  $fifoid = $row["fifoid"];
  //echo $fifoid;
  $fd = fopen("/var/run/starchat/$fifoid", "w");
  if (! $fd) die("cannot open FIFO");
  
  error_log(json_encode($msgArray)."==>$roomid");
    
  fputs($fd, "data: " . json_encode($msgArray) . "\n");
  fclose($fd);
  //sleep(5);
}


if(!strcmp(substr($msgArray["msgBody"],0,2),"id")) {
  
  $new_fifoid = $msgArray["msgBody"];

  /*foreach($result as $row) {
    //  print_r($row);
    
    $remotefifoid = $row["fifoid"];
    $fifosinroom  = array ( "msgBody" => $remotefifoid );
    $fifoid = $new_fifoid;
    $fd = fopen("/var/run/starchat/$fifoid", "w");
    if (! $fd) die("cannot open FIFO");
    
    error_log("!!!".json_encode($fifoinroom));
    
    fputs($fd, "data: " . json_encode($fifoinroom) . "\n");
    fclose($fd);
    }*/

  $query = "INSERT INTO rooms (roomid,fifoid) VALUES (?,?)";
  
  $stmt = $db->prepare($query);
  $ok = $stmt->execute(array($roomid,$new_fifoid));  
}

$db = null;
?>
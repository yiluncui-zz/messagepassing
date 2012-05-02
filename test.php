<?php

	$h = new PDO("sqlite:test.sqlite");
	$ret = $h->query("select * from fun");
	foreach($ret as $i) {
	       echo json_encode($i);
        }	
	
?>
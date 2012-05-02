<?php

    header("Content-Type: text/event-stream");
    header("Cache-Control: no-cache");


    function print_line($fd, $events, $args)
    {
        echo fgets($fd);
    }
    if (strpos($_GET["id"], "/")) die("invalid FIFO");
    $filename = "/var/run/starchat/".$_GET["id"];

    // see note below
    // register_shutdown_function("delete", $filename);

    $fd = fopen($filename, "r");
    if (! $fd) die("cannot read FIFO");

    $base = event_base_new();
    $event = event_new();

    // NOTE: this should really have the EV_PERSIST flag merged in,
    // but PHP (or Apache, or something else) seems to buffer things
    // a bit too much, and the browser ends up getting nothing. This
    // solution is inefficient, but works. However, we lose the
    // opportunity to remove the FIFO, so the number of FIFOs will
    // grow over time, and they will need to be cleaned out somehow.

    // event_set($event, $fd, EV_WRITE | EV_PERSIST, "print_line");
    event_set($event, $fd, EV_WRITE, "print_line");

    event_base_set($event, $base);
    event_add($event);
    event_base_loop($base);
?>








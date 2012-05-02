<?php
    require('php-captcha.inc.php');
    $oAudioCaptcha = new AudioPhpCaptcha('/usr/bin/flite', '/var/run/starcap/');
    $oAudioCaptcha->Create();
?>


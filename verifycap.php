<?php
    require('php-captcha.inc.php');
    if (PhpCaptcha::Validate($_POST['user_code'])) {
    echo "valid";
    } else {
    echo 'valid';
    }
?>


Introduction
------------
With WebRTC, adding a peer-to-peer video chat to a site is as easy as child's play and the best part of it is that there is no need for your users to download plugins to use the service.

There are two pieces needed to set up peer-to-peer video chat using WebRTC; an HTML5 compliant browser, and the proper code on your server. This article will walk you through the steps to get up a simple service up and running.

WebRTC is part of the HTML5 standard and is still under development, but by downloading an augmented WebKit library from [Ericsson Labs](https://labs.ericsson.com) you can try it out today. At present, only 32bit Ubuntu 11.04 is supported for the browser, but there are no such restrictions on the server. For simplicity I'll assume that the server will run the same machine as at least one of the clients.



Installing the browser
---------------------
To install the browser, follow the steps [here](https://labs.ericsson.com/apis/web-real-time-communication/downloads). You can choose to use Epiphany or a simple demo browser (GtkLauncher) for your tests, but for this tutorial I'll use GtkLauncer. To make sure it was installed correctly, fire up a terminal window and go to the WebRTC demo page at Ericsson Labs using the following command:

   /usr/lib/webkitgtk-1.0-0/libexec/GtkLauncher https://webrtc.labs.ericsson.net

If you see a page with a Captcha, you're all set to go, but if you see a warning that your browser lacks support for PeerConnection video conferencing you need to track down the problem. See the [install page](https://labs.ericsson.com/apis/web-real-time-communication/documentation) for hints.

*Note that the following steps are only required if you want to host the signaling server yourself. If you don't, just use the one on [Ericsson Labs](https://labs.ericsson.com/apis/web-real-time-communication).*

Setting up the server
---------------------
With the browser part cleared, we'll now turn to the server setup. First, there are a number of prerequisites that need to be fulfilled. You'll need Apache2, php5, and some supporting modules. Use apt-get to install them by:

     sudo apt-get install apache2 libapache2-mod-php5 php5-dev php-pear

Then, install libevent:

      sudo apt-get install libevent-dev

Finally, you have to add the PHP module for libevent using PECL, but first you have to change some of the PECL settings. You can show the PECL setting using the command

	 pecl config-show

If you're behind a proxy, the first thing to add is

   pear config-set http_proxy http://myproxy.my.org:8080/

where you substitute your proxy and port number. Two things to note is that the command is `pear`, not `pecl`, and that the trailing slash is mandatory.

Next, libevent is considered beta so you need to make pecl aware of that

      pecl config-set preferred_state beta

before the install step

       sudo pecl install libevent

During the install, you will be presented with a question, just hit return to accept the default (autodetect).

If the installer reports that it couldn't update your `php.ini` file, you'll have to do so manually. Open the file using the command

   sudo pico /etc/php5/apache2/php.ini

locate the section "Dynamic Extensions", and add the line

       extension=libevent.so

Now save the file.

### Captcha support (optional)
If your server is accessible from the outside world, you might want to add a Captcha to provide some protection from evil. The following steps will set you up with the necessary support. Note that if you skip this part, you'll need to comment out a section in the code provided for this tutorial, see below.

   sudo apt-get install php5-gd libfreetype6 flite

### Final step
During the connection phase, the server will create FIFO's and we need a suitable place to do so, and we also have to make sure that the server has the permission to create the FIFOs.

       sudo mkdir /var/run/starchat
       sudo chown :www-data /var/run/starchat
       sudo chmod g+w /var/run/starchat

Unfortunately, there is a known bug in the server code that prevents us from cleaning up the FIFOs automatically, so for now we need to use a `cron` job to delete stale FIFO periodically. Use the command

	       crontab -e

to start an editor seesion, and add the following line to the `crontab` file

   0 12 * * 0 find /var/run/starchat -mtime +1 -exec rm -f {} \;

and save the file. Now all FIFOs older than 24 hours will be removed on a regular basis.


All that is left to do before continuing with the fun parts, is to restart the webserver.

    sudo /etc/init.d/apache2 restart

The videochat server code
-------------------------
The [complete code](http://files.labs.ericsson.net/apis/web-real-time-communication/videochat-example.zip) for this tutorial can be downloaded from Ericsson Labs. Next comes a quickstart guide, followed by a longer section detailing the different parts of the implementation.


### Quickstart guide
To install it to the server, `cd` into the directory where the zip file was downloaded and issue the command

   sudo unzip videochat-example.zip -d /var/www/

NB. If you didn't install Captcha support during the server setup part, you must comment out the captcha code in `create.html` and change the hidden property of the `content` div to `false`, like so:

    <!--
    <div id="cap">
    <form>
       <p><img src=visual-captcha.php width="200" height="60" alt="Visual CAPTCHA" /></p>
       <p><a href="audio-captcha.php">Can't see the image? Click for audible version</a></p>
       <label>Enter the contents of image</label>
       <input type="text" name="user_code" id="user_code" />
       <input type="button" onclick="verify();" value="Verify Code"/>
    </form>
    </div>
    -->
    <div id="content" hidden="false">


To test your setup, start a browser

   /usr/lib/webkitgtk-1.0-0/libexec/GtkLauncher http://localhost/videochat-example &

enter the captcha, and you'll be presented with a invitation link. Copy the link and start a second browser with the link as the argument


      /usr/lib/webkitgtk-1.0-0/libexec/GtkLauncher <invitation link> &

When you click accept in the second browser, you should get a media selection dialog and once you click `OK` your video chat session should start.



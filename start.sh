#!/bin/sh
sudo rm -rf /var/run/starchat
sudo mkdir /var/run/starchat
sudo chown :www-data /var/run/starchat
sudo chmod g+w /var/run/starchat
sudo /etc/init.d/apache2 restart
Deploy Instructions
===

This `README` is written for my future reference when I need to redeploy this application into production from scratch. This assumes that I'll be working with a single Digital Ocean droplet (although other VPS solutions should also work).

1. Setup SSH
---

Copy the contents of `~/.ssh/id_rsa.pub` into the SSH key field when setting up a new droplet. Read this [guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2) for more info. On your local machine, add the following lines to `~/.ssh/config`:

```
Host myalias
    HostName [droplet IP address]
    User root
```

Then running `ssh myalias` should automatically log you into the droplet (without a password prompt). Finally you should disable password for root login so that only you can log in with your ssh key.

1. Open `/etc/ssh/sshd_config` in an editor
2. Find `PermitRootLogin yes` and change it to `PermitRootLogin without-password`
3. Run `reload ssh`
4. Log out of the VPS and try to SSH in again (it should not ask for a password this time)

2. Setup Redis as Celery's Backend
---

Redis can't be obtained from Linux package managers (at least not officially at the time of writing this). Instead it has to be downloaded from the website and be built manually.

```
sudo apt-get update
sudo apt-get install build-essential
```

The following commmands need to be updated with whatever the latest version of Redis is.
```
wget http://download.redis.io/releases/redis-3.0.0.tar.gz
tar xzf redis-3.0.0.tar.gz
cd redis-3.0.0
make install
cd utils
sudo ./install_server.sh
```

Now we need to configure Redis to make it more secure. Open `/etc/redis/6379.conf` (default Redis config file location) and add the following:
```
bind 127.0.0.1
requirepass yoursuperlongpassword
```

Finally run `sudo service redis_6379 restart`.

3. Setup RabbitMQ as Celery's Message Broker
---

```
sudo apt-get install rabbitmq-server
```

3. Setup Celery
---

```
sudo apt-get install python-pip
sudo pip install celery
```

4. Setup Database

```
sudo apt-get install mysql-server
mysql -u root -p
[enter password]
CREATE DATABASE mal_cover_css_link;

sudo pip install peewee
sudo pip install PyMySQL
```

5. Setup Flask and other Dependencies
---

```
sudo apt-get install python-dev libxml2-dev libxslt1-dev lib32z1-dev
sudo pip install uwsgi
sudo pip install Flask
sudo pip install lxml
```

Note that building `lxml` will take up a lot of RAM. If you're using the 512 mb Digital Ocean droplet, you need to setup a swap file.

```
sudo dd if=/dev/zero of=/swapfile bs=1024 count=524288
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

<!---
```
sudo apt-get install nginx
mkdir /var/www/malcovercss.link
cd /var/www/malcovercss.link

sudo apt-get install git
git clone https://github.com/Trinovantes/MyAnimeList-Cover-CSS-Generator.git .
```

`sudo vim /etc/nginx/sites-available/default`

```
server {
    listen 80
    location / { 
        try_files $uri @yourapplication; 
    }
    location @yourapplication {
        include uwsgi_params;
        uwsgi_pass unix:/tmp/uwsgi.sock;
    }
}

```

`uwsgi -s /tmp/uwsgi.sock -w main:flaskapp --chown-socket=www-data:www-data --master`


```
```
-->

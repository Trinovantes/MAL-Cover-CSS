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

This should automatically start your RabbitMQ server after it finishes.

4. Setup Database

```
sudo apt-get install mysql-server
mysql -u root -p
[enter password]
CREATE DATABASE mal_cover_css_link;

sudo pip install peewee
sudo pip install PyMySQL
```

5. (Part 1) Setup Celery
---

Step 5 Parts 1 and 2 are mutually exclusive so they can be done in either order.

```
sudo apt-get install python-pip
sudo pip install celery
```

We want to create a new unprivileged user to run the script just to be safe (according to the [FAQ]()http://celery.readthedocs.org/en/latest/faq.html#is-it-safe-to-run-celery-worker-as-root). We can simply run `sudo adduser celery`.

Next we need to setup the `init.d` scripts to run Celery as a daemon service.
```
cd /etc/init.d/
wget https://github.com/celery/celery/blob/3.1/extra/generic-init.d/celeryd
cd /etc/default/
vim celeryd
```

Add the following to your new `/etc/default/celeryd` file (update the details accordingly):
```
# Names of nodes to start
#   most will only start one node:
CELERYD_NODES="worker1"

# Absolute or relative path to the 'celery' command:
CELERY_BIN="/usr/local/bin/celery"
#CELERY_BIN="/virtualenvs/def/bin/celery"

# App instance to use
# comment out this line if you don't use an app
CELERY_APP="proj"
# or fully qualified:
#CELERY_APP="proj.tasks:app"

# Where to chdir at start.
CELERYD_CHDIR="/opt/Myproject/"

# Extra command-line arguments to the worker
CELERYD_OPTS="--time-limit=300 --concurrency=8"

# %N will be replaced with the first part of the nodename.
CELERYD_LOG_FILE="/var/log/celery/%N.log"
CELERYD_PID_FILE="/var/run/celery/%N.pid"

# Workers should run as an unprivileged user.
#   You need to create this user manually (or you can choose
#   a user/group combination that already exists, e.g. nobody).
CELERYD_USER="celery"
CELERYD_GROUP="celery"

# If enabled pid and log directories will be created if missing,
# and owned by the userid/group configured.
CELERY_CREATE_DIRS=1
```

Now do the same thing to run Celery Beat as a daemon service.
```
cd /etc/init.d/
wget https://github.com/celery/celery/blob/3.1/extra/generic-init.d/celerybeat
cd /etc/default/
vim celerybeat
```

Add the following to `/etc/default/celerybeat` file:
```
# Absolute or relative path to the 'celery' command:
CELERY_BIN="/usr/local/bin/celery"
#CELERY_BIN="/virtualenvs/def/bin/celery"

# App instance to use
# comment out this line if you don't use an app
CELERY_APP="proj"
# or fully qualified:
#CELERY_APP="proj.tasks:app"

# Where to chdir at start.
CELERYBEAT_CHDIR="/opt/Myproject/"

# Extra arguments to celerybeat
CELERYBEAT_OPTS="--schedule=/var/run/celery/celerybeat-schedule"
```

Finally we can start the two scripts:
```
sudo service celeryd start
sudo service celerybeat start
```

If you get this error `IOError: [Errno 13] Permission denied: '/var/log/celery/celery.log'`, then run `sudo chown celery:celery /var/log/celery`.


5. (Part 2) Setup Flask Server
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

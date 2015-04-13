Deploy Instructions
===

This `README` is written for my future reference when I need to redeploy this application into production from scratch. This assumes that I'll be working with a single DigitalOcean droplet running Ubuntu 14.04.1 LTS (these instructions should also work with other VPS as well).

0. Setup SSH
---

Copy the contents of `~/.ssh/id_rsa.pub` into the SSH key field when setting up a new droplet. Read this [guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2) for more info. On your local machine, add the following lines to `~/.ssh/config`:
```
Host myalias
    HostName [server IP address]
    User root
```

Then running `ssh myalias` should automatically log you into the droplet (without a password prompt).

1. Setup Essentials
---

Assuming that you are working on a clean VPS image, then the server should have nothing on it. Run the following to install the essential tools:
```
apt-get update
apt-get install build-essential
apt-get install git python-pip
apt-get install python-dev libxml2-dev libxslt1-dev lib32z1-dev
```

2. Setup Redis as Celery's Backend
---

This is for installing the Python library for accessing Redis.
```
pip install redis
```

Redis can't be obtained from Linux package managers (at least not officially at the time of writing this). Instead it has to be downloaded from the website and be built manually. The following commmands need to be updated with whatever the latest version of Redis is.
```
wget http://download.redis.io/releases/redis-3.0.0.tar.gz
tar xzf redis-3.0.0.tar.gz
cd redis-3.0.0
make install
cd utils
./install_server.sh
```

Now we need to configure Redis to make it more secure. Open `/etc/redis/6379.conf` (default Redis config file location) and add the following:
```
bind 127.0.0.1
requirepass yoursuperlongpassword
```

Finally run `service redis_6379 restart`.

3. Setup RabbitMQ as Celery's Message Broker
---

```
apt-get install rabbitmq-server
```

This should automatically start your RabbitMQ server after it finishes.

4. Setup Database
---

Note when installing `mysql-server`, it will prompt you for a password for `root` user. Feel free to make it as long as you want (e.g. I used 40+ characters).
```
apt-get install mysql-server
mysql -u root -p
[enter password]
CREATE DATABASE malcovercss;
```

Finally install the following Python libraries for accessing MySQL:
```
pip install peewee
pip install PyMySQL
```

5. Get Source Code for this Application
---

```
mkdir /var/www/malcovercss.link
cd /var/www/malcovercss.link
git clone https://github.com/Trinovantes/MyAnimeList-Cover-CSS-Generator.git .
vim private.py
```

In your new `private.py` file (ignored in `.gitignore`), define the following variables (update accordingly):
```
MYSQL_DATABASE        = 'malcovercss'
MYSQL_USERNAME        = 'root'
MYSQL_PASSWORD        = 'your mysql password'

REDIS_PASSWORD        = 'your redis password'
REDIS_HOST            = 'localhost'
REDIS_PORT            = '6379'
REDIS_DB              = '0'

CELERY_BROKER_URL     = 'amqp://'
CELERY_RESULT_BACKEND = 'redis://:' + REDIS_PASSWORD + '@' + REDIS_HOST + ':' + REDIS_PORT + '/' + REDIS_DB

USER_AGENT            = 'api-indiv-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
IS_DEBUG              = False
REQUESTS_TIMEOUT      = 1
```

6. (Part 1) Setup Celery
---

Step 6 Parts 1 and 2 are mutually exclusive so they can be done in either order.

```
pip install celery
```

We want to create a new unprivileged user to run the script just to be safe (according to the [FAQ](http://celery.readthedocs.org/en/latest/faq.html#is-it-safe-to-run-celery-worker-as-root)). We can run `adduser celery`.

Next we need to setup the `init.d` scripts to run Celery as a daemon service.
```
cd /etc/init.d/
wget https://raw.githubusercontent.com/celery/celery/3.1/extra/generic-init.d/celeryd
cd /etc/default/
vim celeryd
```

Add the following to your new `/etc/default/celeryd` file (update the details accordingly). Read [this](http://celery.readthedocs.org/en/latest/tutorials/daemonizing.html#example-configuration) for more info.
```
CELERYD_NODES="worker1"
CELERY_BIN="/usr/local/bin/celery"

CELERY_APP="celeryapp"
CELERYD_CHDIR="/var/www/malcovercss.link/"

CELERYD_OPTS="--time-limit=300 --concurrency=8"
CELERYD_LOG_FILE="/var/log/celery/%N.log"
CELERYD_PID_FILE="/var/run/celery/%N.pid"

CELERYD_USER="celery"
CELERYD_GROUP="celery"
CELERY_CREATE_DIRS=1
```

Now do the same thing to run Celery Beat as a daemon service.
```
cd /etc/init.d/
wget https://raw.githubusercontent.com/celery/celery/3.1/extra/generic-init.d/celerybeat
cd /etc/default/
vim celerybeat
```

Add the following to `/etc/default/celerybeat` file. Read [this](http://celery.readthedocs.org/en/latest/tutorials/daemonizing.html#generic-initd-celerybeat-example) for more info.
```
CELERY_BIN="/usr/local/bin/celery"

CELERY_APP="celeryapp"
CELERYBEAT_CHDIR="/var/www/malcovercss.link/"

CELERYBEAT_OPTS="--schedule=/var/run/celery/celerybeat-schedule"
```

Finally we can start the two scripts:
```
service celeryd start
service celerybeat start
```

If you get this error `IOError: [Errno 13] Permission denied: '/var/log/celery/celery.log'`, then run `chown celery:celery /var/log/celery`.


6. (Part 2) Setup Flask to Run with uWSGI and Nginx
---

```
apt-get install nginx
pip install uwsgi
pip install Flask flask_limiter Flask-Cache
pip install lxml
```

Note that building `lxml` will take up a lot of RAM. If you're using the 512 mb DigitalOcean droplet, you need to setup a swap file.

```
dd if=/dev/zero of=/swapfile bs=1024 count=524288
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```





<!---
```
apt-get install nginx

```

`vim /etc/nginx/sites-available/default`

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

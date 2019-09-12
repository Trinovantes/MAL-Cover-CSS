# On Remote Server

```
sudo mkdir -p /var/www/malcovercss.link
sudo mkdir -p /var/www/letsencrypt
sudo chown ubuntu:ubuntu /var/www/malcovercss.link
```

```
# Install CouchDB
sudo apt install apt-transport-https gnupg ca-certificates
echo "deb https://apache.bintray.com/couchdb-deb bionic main" | sudo tee -a /etc/apt/sources.list.d/couchdb.list
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8756C4F765C9AC3CB6B85D62379CE192D401AB61
sudo apt update
sudo apt install couchdb

# Install Redis
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install
cd utils
sudo ./install-server.sh
sudo service redis_6379 start

# Install pm2
sudo npm install pm2 -g
pm2 install pm2-logrotate
```

Create the nginx configuration file (`/etc/nginx/sites-available/malcovercss.link`):
```
#-------------------------------------------------------------------------------
# malcovercss.link
#-------------------------------------------------------------------------------

server {
    listen 80;
    server_name malcovercss.link www.malcovercss.link;

    include /etc/nginx/snippets/letsencrypt.conf;

    location / {
        return 301 https://www.malcovercss.link$request_uri;
    }
}

server {
    listen 443;
    server_name malcovercss.link;

#    ssl_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
#    ssl_certificate_key /etc/letsencrypt/live/malcovercss.link/privkey.pem;
#    ssl_trusted_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
#    include /etc/nginx/snippets/ssl.conf;

    location / {
        return 301 https://www.malcovercss.link$request_uri;
    }
}

server {
    listen      443;
    server_name www.malcovercss.link;
    autoindex   off;

#    ssl_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
#    ssl_certificate_key /etc/letsencrypt/live/malcovercss.link/privkey.pem;
#    ssl_trusted_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
#    include /etc/nginx/snippets/ssl.conf;

    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

The SSL options are initially commented out because those files do not exist yet. This will allow us to start nginx for the initial authentication without getting `FileDoesNotExist` errors.


Next symlink the config file to `sites-enabled`:
```
sudo ln -s /etc/nginx/sites-available/malcovercss.link /etc/nginx/sites-enabled/
```

Create the common nginx file (`/etc/nginx/snippets/ssl.conf`):
```
ssl on;

# certs sent to the client in SERVER HELLO are concatenated in ssl_certificate
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# modern configuration. tweak to your needs.
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers AES256+EECDH:AES256+EDH:!aNULL;
ssl_prefer_server_ciphers on;

# HSTS (ngx_http_headers_module is required) (15768000 seconds = 6 months)
add_header Strict-Transport-Security max-age=15768000;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;

# OCSP Stapling ---
# fetch OCSP records from URL in ssl_certificate and cache them
ssl_stapling on;
ssl_stapling_verify on;
```

Create the common nginx file (`/etc/nginx/snippets/letsencrypt.conf`):
```
location ^~ /.well-known/acme-challenge/ {
    default_type "text/plain";
    root /var/www/letsencrypt;
}
```

Now we can restart nginx (`sudo systemctl restart nginx`) to host the non-SSL version for Let's Encrypt authentication challenge.
```
sudo certbot certonly --webroot -d malcovercss.link -d www.malcovercss.link --webroot-path /var/www/letsencrypt
```

After this, go back to `/etc/nginx/sites-available/malcovercss.link` and uncomment the SSL options.

# Deploy

On local machine:
```
git clone git@github.com:Trinovantes/MyAnimeList-Cover-CSS-Generator.git
cd MyAnimeList-Cover-CSS-Generator
pm2 deploy production setup
```

Then on the remote machine, create and update `config.js` (gitignored) in `/var/www/malcovercss.link/current/src` directory:
```
'use strict'

module.exports = {

    COUCHDB_CONFIG : {
        url: (function () {
            const USERNAME = '';
            const PASSWORD = '';
            const PORT = 5984;
            return `http://${USERNAME}:${PASSWORD}@localhost:${PORT}`
        })(),
    },

    REDIS_CONFIG : {
        port: 6379,
        password: '',
        host: 'localhost'
    },

    DB_NAME: 'malcovercss',
    MAL_USERS_DESIGN : 'mal_users',
    MAL_ITEMS_DESIGN : 'mal_items',

    SCRAPING_DELAY : 24 * 60 * 60 * 1000,

    JOB_REPEAT_DELAY : (function() {
        if (process.env.NODE_ENV === 'dev') {
            return '*/10 * * * * *';
        } else {
            return '0 0/2 * * *';
        }
    }()),

};
```

Finally on local machine:
```
pm2 deploy production
```

# Startup Scripts

## PM2
```
pm2 save
pm2 startup
```

## CouchDB
```
sudo apt install runit runit-systemd
sudo mkdir /etc/sv/couchdb
sudo mkdir /etc/sv/couchdb/log
```

Create `/etc/sv/couchdb/log/run`
```
#!/bin/sh
exec svlogd -tt /var/log/couchdb
```

Create `/etc/sv/couchdb/run`
```
#!/bin/sh
export HOME=/opt/couchdb
exec 2>&1
exec chpst -u couchdb /opt/couchdb/bin/couchdb
```

```
sudo chmod u+x /etc/sv/couchdb/log/run
sudo chmod u+x /etc/sv/couchdb/run
sudo ln -s /etc/sv/couchdb/ /etc/service/couchdb
sudo sv status couchdb
```

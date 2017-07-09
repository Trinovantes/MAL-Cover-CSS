# On Remote Server

```
# Install MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install mongodb-org
sudo service mongod start

# Install Redis
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install
cd utils
./install-server.sh
sudo service redis_6379 start

# Install pm2
sudo npm install pm2 -g
```

Create `config.js` (gitignored) in `/var/www/malcovercss.link/current` directory:
```
'use strict'

module.exports = {
    getMongoDbURL : function () {
        const USERNAME = 'malcovercss';
        const PASSWORD = ''; // Enter password
        const DB_NAME = 'malcovercss';
        const HOST = 'localhost';
        const PORT = ''; // Enter port

        return 'mongodb://'
            + ((typeof USERNAME === 'undefined' || typeof PASSWORD === 'undefined') ? '' : (USERNAME + ':' + PASSWORD + '@'))
            + HOST + ':' + PORT + '/' + DB_NAME;
    },

    REDIS_CONFIG : {
        port : 6379,
        db   : 0,
        auth : '', // Enter password
        host : 'localhost'
    },

    USER_AGENT : '', // myanimelist.net API key

    USERS_COLLECTION     : 'users',
    MAL_ITEMS_COLLECTION : 'malitems',
    SCRAPING_DELAY       : 7 * 24 * 60 * 60 * 1000,

    SCRAPE_USER_JOB_KEY  : 'scrape',
    GENERATE_CSS_JOB_KEY : 'generate',
};
```

Configure nginx in `/etc/nginx/sites-available/default`:
```
#-------------------------------------------------------------------------------
# malcovercss.link
#-------------------------------------------------------------------------------

server {
    listen 80;
    server_name malcovercss.link;
    
    include /etc/nginx/snippets/letsencrypt.conf;

    location / {
        return 301 https://www.malcovercss.link$request_uri;
    }
}

server {
    listen      443;
    server_name www.malcovercss.link;
    autoindex   off;
    
    ssl_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/malcovercss.link/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/malcovercss.link/fullchain.pem;
    include /etc/nginx/snippets/ssl.conf;

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

Common nginx File (`/etc/nginx/snippets/ssl.conf`):
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

Common nginx File (`/etc/nginx/snippets/letsencrypt.conf`):
```
location ^~ /.well-known/acme-challenge/ {
    default_type "text/plain";
    root /var/www/letsencrypt;
}
```

# Local Machine
```
git clone git@github.com:Trinovantes/MyAnimeList-Cover-CSS-Generator.git
cd MyAnimeList-Cover-CSS-Generator
pm2 deploy production
```

# Local Development

```sh
git clone git@github.com:Trinovantes/MAL-Cover-CSS.git
cd MAL-Cover-CSS

mkdir -p /var/secrets/
ln -s ${PWD}/build/secrets /var/secrets/malcovercss

yarn install
yarn dockerDev
```

**Note:** We need to manually create the files containing our app's secrets
```sh
$ ls build/secrets/
ENCRYPTION_KEY.txt
MAL_CLIENT_ID.txt
MAL_CLIENT_SECRET.txt
MYSQL_DATABASE.txt
MYSQL_HOST.txt
MYSQL_PASSWORD.txt
MYSQL_USER.txt
```

# Deploy to Production

## Set up Remote Production Server

On our local machine, update `~/.ssh/config` with production server's information:
```
Host digital-ocean
    User root
    HostName xxx.xxx.xxx.xxx
```

Run the provision script
```sh
# Run this on local machine
sh build/provision.sh

# Run this on remote server to validate
certbot renew --dry-run
```

We also need add this line in `/etc/letsencrypt/cli.ini` to ensure nginx reloads whenever we renew our certificates.
```
deploy-hook = systemctl reload nginx
```

## Deploy from Local Machine

```sh
# Configure remote context for docker
docker context create remote --docker "host=ssh://digital-ocean"
docker context use remote

# Builds and deploy to remote host via SSH
yarn dockerPull
yarn dockerProdUp
```

**Note:** The remote machine's `sshd` may need its `MaxSession` increased if the deployment script has connection errors. Read [this thread](https://github.com/docker/compose/issues/6463#issuecomment-623746349) for more information.

## Deploy from GitHub Actions

Create the following secrets for `production` environment

* `SSH_USER`
* `SSH_HOST`
* `SSH_PRIVATE_KEY`
* `DOCKER_ACCESS_TOKEN`

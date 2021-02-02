# MAL Cover CSS

Automatically generate CSS to insert cover images into your MyAnimeList.net profile

## Local Development

```sh
git clone git@github.com:Trinovantes/MAL-Cover-CSS.git
cd MAL-Cover-CSS

mkdir -p /var/secrets/
ln -s ${PWD}/build/secrets /var/secrets/malcovercss

yarn install
make dev
```

**Note:** We need to manually create the files containing our app's secrets under `build/secrets`

Secret | Example
--- | ---
`ENCRYPTION_KEY.txt` | `openssl rand -base64 32`
`MAL_CLIENT_ID.txt` | Create app and obtain API access from [MyAnimeList.com](https://myanimelist.net/apiconfig)
`MAL_CLIENT_SECRET.txt` | Create app and obtain API access from [MyAnimeList.com](https://myanimelist.net/apiconfig)
`MYSQL_DATABASE.txt` | Database Name
`MYSQL_HOST.txt` | `db` (network name)
`MYSQL_PASSWORD.txt` | `openssl rand -base64 20`
`MYSQL_USER.txt` | Database User

## Deploy to Production

### Set up Remote Production Server

On our local machine, update `~/.ssh/config` with production server's information:
```
Host digital-ocean
    User root
    HostName xxx.xxx.xxx.xxx
```

Run the provisioning script
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

### Deploy from Local Machine

```sh
# Configure remote context for docker
docker context create remote --docker "host=ssh://digital-ocean"
docker context use remote

# Builds and deploy to remote host via SSH
make pull
make prodUp
```

**Note:** The remote machine's `sshd` may need its `MaxSession` increased if the deployment script has connection errors. Read [this thread](https://github.com/docker/compose/issues/6463#issuecomment-623746349) for more information.

### Deploy from GitHub Actions

Create the following secrets for `production` environment

Secret | Example
---    | ---
`SSH_USER` | Username
`SSH_HOST`| IP address
`SSH_PRIVATE_KEY`| `ssh-keygen -N '' -f ~/.ssh/malcovercss-ci -C "root@malcovercss"` <br> Add `malcovercss-ci.pub` to `authorized_keys` <br> Add `malcovercss_ci` (private key) to this secret
`SSH_KEYSCAN`| `ssh-keyscan -t ecdsa xxx.xxx.xxx.xxx`
`CR_PAT` | Create a [Personal Access Token](https://github.com/settings/tokens) with read/write permissions for GitHub Container Registry

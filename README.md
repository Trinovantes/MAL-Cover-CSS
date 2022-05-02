# MAL Cover CSS

This website was originally created before MyAnimeList launched their new "Modern" templates in 2016.

Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.

Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.

## Setting up GitHub Actions

Secret | Description
---    | ---
`SSH_USER` | Username of server
`SSH_HOST`| IP address of server
`SSH_PRIVATE_KEY`| `ssh-keygen -N '' -f ~/.ssh/github-actions -C "github-actions"` <br> Add `github-actions.pub` to `~/.ssh/authorized_keys` <br> Add `github-actions` to this secret
`SSH_KEYSCAN`| `ssh-keyscan -t ecdsa SSH_HOST`

### `ENV_FILE`
```
# Build env
APP_URL             https://www.malcovercss.link
APP_PORT            9040

# Runtime env (during dev when running outside of docker)
REDIS_HOST          localhost
REDIS_PORT          9041

# Runtime env
ENCRYPTION_KEY      openssl rand -base64 32
MAL_CLIENT_ID       From https://myanimelist.net/login.php?from=%2Fapiconfig&account_policy=AP1
MAL_CLIENT_SECRET   From https://myanimelist.net/login.php?from=%2Fapiconfig&account_policy=AP1
```

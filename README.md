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

### `ENV_DEV` and `ENV_PROD`

```sh
# -----------------------------------------------------------------------------
# Build env (must be passed to frontend via webpack.DefinePlugin)
# -----------------------------------------------------------------------------

WEB_URL=http://test.malcovercss.link:9040
WEB_PORT=9040
API_URL=http://test.malcovercss.link:9042
API_PORT=9042

# -----------------------------------------------------------------------------
# Runtime env
# -----------------------------------------------------------------------------

# Only for dev (when redis is outside of docker)
REDIS_HOST=localhost
REDIS_PORT=9041

S3_BUCKET_BACKUP=

# openssl rand -base64 32
ENCRYPTION_KEY=

# https://myanimelist.net/login.php?from=%2Fapiconfig&account_policy=AP1
MAL_CLIENT_ID=
MAL_CLIENT_SECRET=

AWS_ENDPOINT_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

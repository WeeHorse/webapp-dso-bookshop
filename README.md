# DSO Bookshop

A small Express + SQLite web app. The server runs over **HTTPS only**, so you must create a local certificate before it will start.

## Why HTTPS?

- `index.js` creates the server with `https.createServer(...)` and reads `certs/key.pem` and `certs/cert.pem`. If those files are missing, the app crashes with `ENOENT: no such file or directory, open '.../certs/key.pem'`.
- The session cookie in `login.js` uses `secure: 'auto'`. The browser only keeps and sends it over HTTPS, so login depends on HTTPS working.

## Quick start

```bash
npm install
# create the certificate (see below), then:
npm start
```

Open **https://localhost:3005** (note the `s`). To use another port, set `PORT`, e.g. `PORT=4000 npm start`.

## Setting up the certificate

The `certs/` folder is in `.gitignore`. Never commit private keys. Every student creates their own.

First create the folder in the project root:

```bash
mkdir certs
```

Then choose **Option A** (recommended) or **Option B**.

### Option A: mkcert (recommended, no browser warnings)

[mkcert](https://github.com/FiloSottile/mkcert) creates a small local certificate authority (CA) on your computer and makes your OS and browsers trust it. Certificates it issues show a normal padlock.

1. Install mkcert:
   - **macOS:** `brew install mkcert`
   - **Windows:** `choco install mkcert` or `scoop install mkcert`
   - **Linux:** see the [mkcert install instructions](https://github.com/FiloSottile/mkcert#linux)
2. Install the local CA (once per computer):
   ```bash
   mkcert -install
   ```
   Restart your browser afterwards. Firefox on Linux may also need `libnss3-tools`.
3. Generate the certificate files from the project root:
   ```bash
   mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 ::1
   ```

### Option B: openssl (self-signed, browser will warn)

Use this if you can't install mkcert. The command is the same on macOS, Linux and Git Bash on Windows.

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -keyout certs/key.pem -out certs/cert.pem \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

The first time you open the site, the browser shows a warning such as "Your connection is not private".
- **Chrome / Edge:** Advanced → *Proceed to localhost (unsafe)*
- **Firefox:** Advanced → *Accept the Risk and Continue*
- **Safari:** *Show Details* → *visit this website*

This is safe on your own machine. The warning only appears because nothing vouches for your self-made certificate.

## Check that it works

1. Run `npm start`. You should see `Listening on https://localhost:3005`.
2. Open https://localhost:3005. The page loads and the browser shows a padlock (Option A) or a warning you can click through (Option B).
3. Try to log in. If it works, the secure session cookie is working.

## Troubleshooting

| Problem | Cause / fix |
|---|---|
| `ENOENT ... certs/key.pem` | The certificate files don't exist yet, or they are in the wrong place. You need exactly `certs/key.pem` and `certs/cert.pem` in the project root. |
| Browser can't connect, or shows `ERR_SSL_PROTOCOL_ERROR` | You opened `http://` instead of `https://`. The server doesn't answer plain HTTP. |
| Still "not private" after using mkcert | Run `mkcert -install` and restart the browser completely. |
| `EADDRINUSE` | Port 3005 is taken. Stop the other process or use `PORT=3006 npm start`. |
| Login seems to work but you're logged out on reload | The cookie isn't being kept. Make sure you use `https://localhost:3005`, not `http://` or an IP address the certificate doesn't cover. |
| Certificate expired (openssl option) | Delete `certs/` and generate a new one. |
| `Error: Cannot find module 'better-sqlite3'` / native module errors | Run `npm install` again. Make sure your Node version is current. |

## Notes for teachers / deployment

- The certificate is for **local development only**. In production, use a real certificate (e.g. Let's Encrypt), or let a reverse proxy such as nginx or Caddy handle HTTPS.
- Behind a reverse proxy that handles HTTPS, add `app.set('trust proxy', 1)` so `secure: 'auto'` cookies still work.

# BP-Log introductory website

Static website imported from https://github.com/twwspes/OfflineBPLog-Intro.
Only the site files were copied; its Git history was not imported.

## Preview locally

From the BP-Log repository root:

```sh
python3 -m http.server 8000 --directory docs
```

Open http://localhost:8000. Stop the server with Ctrl+C.
The site uses external CDNs for fonts, Bootstrap, Font Awesome, and jQuery,
so an internet connection is required for its full appearance and behaviour.

## Publish with GitHub Pages

After committing and pushing these files to `main`, open the OfflineBPLog
repository's **Settings → Pages**. Under **Build and deployment**, select
**Deploy from a branch**, choose `main` and `/docs`, and save.

The website and privacy policy address is https://twwspes.github.io/OfflineBPLog/.
No npm build or app dependencies are required.
Use this address in app store listings and other references to the privacy policy.

## Editing

- `index.html`: translated content, store links, and language switching.
- `css/styles.css`: website styling.
- `images/`: screenshots and store download badges.

Keep image paths relative so the site works under GitHub Pages' repository path.

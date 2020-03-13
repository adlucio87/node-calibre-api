node-calibre-api
====================

A little Node.JS application that expose an API to do ebook conversion using calibre ebook-convert command.


Usage
--------

Run the application by building the image and running it:
```bash
docker run --restart always -d --name calibre -p 3000:3000 adlucio87/node-calibre-api
```

Or by building the image using the Dockerfile.


Then to convert a .epub ebook to .mobi, use:
```
curl -O -J -L -s \
    -H 'Content-Type: multipart/form-data' \
    --form 'file=@/tmp/file.epub' \
    --form 'to=mobi' \
    'http://localhost:3000/calibre/ebook-convert'
```
make build to google cloud
```
gcloud builds submit --tag gcr.io/sendtokindle-cb739/calibre
```
deploy it on google cloud
```
gcloud beta run deploy --image gcr.io/sendtokindle-cb739/calibre --platform managed
gcloud beta run deploy --image gcr.io/sendtokindle-cb739/ebook-converter --platform managed
calibre project data
```
https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py
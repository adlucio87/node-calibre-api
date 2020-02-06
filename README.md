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
gcloud builds submit --tag gcr.io/sendtokindle-cb739/calibre
gcloud beta run deploy --image gcr.io/sendtokindle-cb739/calibre --platform managed
https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py


Step 3/16 : RUN sudo -v && wget -nv -O- https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py | sudo python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main()"
 ---> Running in 16797f748e54
/bin/sh: 1: sudo: not found
The command '/bin/sh -c sudo -v && wget -nv -O- https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py | sudo python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main()"' returned a non-zero code: 127
ERROR
ERROR: build step 0 "gcr.io/cloud-builders/docker" failed: step exited with non-zero status: 127

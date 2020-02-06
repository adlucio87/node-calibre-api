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



  "error": "Error while converting file",
    "trace": "Traceback (most recent call last):\n  File \"site.py\", line 77, in main\n  File \"site-packages/calibre/ebooks/conversion/cli.py\", line 401, in main\n  File \"site-packages/calibre/ebooks/conversion/plumber.py\", line 1110, in run\n  File \"site-packages/calibre/customize/conversion.py\", line 246, in __call__\n  File \"site-packages/calibre/ebooks/conversion/plugins/pdf_input.py\", line 54, in convert\n  File \"site-packages/calibre/ebooks/pdf/pdftohtml.py\", line 90, in pdftohtml\nConversionError: pdftohtml failed with return code: 127\n/opt/calibre/bin/pdftohtml: error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory\n"
}
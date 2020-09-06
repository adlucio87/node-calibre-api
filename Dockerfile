#FROM ubuntu:14.04.2
FROM ubuntu:18.04

# Install calibre deps and then nodejs deps
RUN apt-get update \
    && apt-get install -y \
        python \
        wget \
        gcc \
        xz-utils \
        imagemagick \
        xdg-utils \
        libnss3 \
    && apt-get install -y \
        build-essential \
        curl \
    && apt-get install -y \
      #  git-core \
    && apt-get clean


# Install calibre
#RUN sudo -v && wget -nv -O- https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py | sudo python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main()"
RUN wget -nv -O- https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py |  python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main()"

# Install nodejs
ENV USER nodejs
#ENV NODE_VERSION 6.9.5
ENV NODE_VERSION 12.18.3

RUN useradd --create-home --shell /bin/bash $USER

USER $USER

RUN cd \
    && mkdir tools \
    && curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
    && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /home/$USER/tools/ \
    && rm "node-v$NODE_VERSION-linux-x64.tar.gz"

ENV PATH $PATH:/home/$USER/tools/node-v$NODE_VERSION-linux-x64/bin

# Get project from github repo
# Old repo git remote add origin https://github.com/denouche/node-calibre-api.git
ENV PROJECT_DIRECTORY node-calibre-api
#RUN cd \
#    && mkdir -p www/$PROJECT_DIRECTORY/ \
#    && cd www/$PROJECT_DIRECTORY \
#    && git init \
#    && git remote add origin https://github.com/adlucio87/node-calibre-api.git

#or get the project from local folder
RUN mkdir -p /home/$USER/www/$PROJECT_DIRECTORY/

COPY . /home/$USER/www/$PROJECT_DIRECTORY/

#for using remote config for setting and password
#need to install java and jarn.. to match
#https://github.com/firebase/firebase-js-sdk#readme


# set env
ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

WORKDIR /home/$USER/www/$PROJECT_DIRECTORY

# update project at every container start
#CMD git pull origin master && npm install && npm start
CMD npm install && npm start

#RUN --restart always -d --name calibre -p 3000:3000 adlucio87/node-calibre-api
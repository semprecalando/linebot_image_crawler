FROM node:16.16.0-bullseye-slim
LABEL maintainer="clan"

RUN apt-get update && apt-get upgrade\
    && apt-get install -y vim curl less unzip gcc make \
    build-essential libbz2-dev libdb-dev \
    libreadline-dev libffi-dev libgdbm-dev liblzma-dev \
    libncursesw5-dev libsqlite3-dev libssl-dev \
    zlib1g-dev uuid-dev tk-dev

RUN cd /opt \
    && curl -q "https://www.python.org/ftp/python/3.8.10/Python-3.8.10.tgz" -o Python-3.8.10.tgz \
    && tar -xzf Python-3.8.10.tgz \
    && cd Python-3.8.10 \
    && ./configure --enable-optimizations \
    && make install

RUN cd /opt \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install

RUN npm install -g aws-cdk@2.32.0 typescript@4.7.4

# clean up unnecessary files
RUN rm -rf /opt/*

# Make command line prettier...
RUN echo "alias ls='ls --color=auto'" >> /root/.bashrc
RUN echo "PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@linebot-image-crawler\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> /root/.bashrc

# set alias
RUN echo 'alias python="python3"' >> /root/.bashrc
RUN echo 'alias pip="pip3"' >> /root/.bashrc

RUN mkdir -p /root/.ssh
CMD ["/bin/bash"]
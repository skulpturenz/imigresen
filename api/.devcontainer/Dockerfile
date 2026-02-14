FROM clojure AS base

RUN git config --global pager.branch false

COPY ./kryptos.sh /usr/local/bin/kryptos
RUN chmod u+x /usr/local/bin/kryptos

RUN apt update && apt upgrade -y && apt install -y vim gnupg2 bash-completion

FROM base

RUN sed -i '/^Components:/s/ main/ main contrib non-free non-free-firmware/' /etc/apt/sources.list.d/debian.sources && \
    apt update && \
    apt upgrade -y && \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt install -y ttf-mscorefonts-installer && \
    echo ". /etc/bash_completion" >> /etc/bash.bashrc

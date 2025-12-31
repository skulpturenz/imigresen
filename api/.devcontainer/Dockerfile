FROM clojure AS base

RUN git config --global pager.branch false

RUN sed -i '/^Components:/s/ main/ main contrib non-free non-free-firmware/' /etc/apt/sources.list.d/debian.sources && \
    apt update && \
    apt upgrade -y && \
    apt install -y vim gnupg2 bash-completion && \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt install ttf-mscorefonts-installer && \
    echo ". /etc/bash_completion" >> /etc/bash.bashrc

FROM base

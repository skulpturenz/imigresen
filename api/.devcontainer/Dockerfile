FROM clojure AS base

RUN git config --global pager.branch false

RUN apt update && \
    apt upgrade -y && \
    apt install -y vim gnupg2 bash-completion fonts-open-sans && \
    echo ". /etc/bash_completion" >> /etc/bash.bashrc

FROM base

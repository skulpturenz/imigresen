FROM clojure AS base

RUN git config --global pager.branch false

RUN apt update && \
    apt upgrade -y && \
    apt install -y vim gnupg2 bash-completion && \
    echo ". /etc/bash_completion" >> /etc/bash.bashrc

FROM base

RUN git clone https://github.com/ingydotnet/git-subrepo /git-subrepo && \
    echo 'source /git-subrepo/.rc' >> ~/.bashrc

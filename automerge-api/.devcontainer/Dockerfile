FROM node:lts AS base

RUN apt update && apt upgrade -y && apt install vim bash-completion -y
RUN git config --global pager.branch false
RUN echo "if [ -f /etc/bash_completion ]; then\n\t. /etc/bash_completion\nfi" >> /etc/bash.bashrc

FROM base

RUN bash -c "corepack enable pnpm && pnpm config set store-dir /home/node/.local/share/pnpm/store"

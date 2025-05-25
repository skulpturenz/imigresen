FROM node:lts AS base

RUN apt update && apt upgrade -y && apt install vim -y
RUN git config --global pager.branch false

FROM base

RUN bash -c "corepack enable pnpm && pnpm config set store-dir /home/node/.local/share/pnpm/store"

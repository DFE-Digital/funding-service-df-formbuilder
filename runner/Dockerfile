# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:18.16.0 AS base
RUN mkdir -p /usr/src/app && \
    addgroup --gid 1001 appuser && \
    adduser  --uid 1001 --ingroup appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apt update --yes && \
    apt install --yes bash git

# ----------------------------
# Stage 2
# Cache layer contains npm packages for all workspaces
# It will re-run only if one of the copied files change, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser .yarn ./.yarn/
COPY --chown=appuser:appuser package.json yarn.lock .yarnrc.yml tsconfig.json  ./
COPY --chown=appuser:appuser model/package.json ./model/
COPY --chown=appuser:appuser runner/package.json ./runner/
# Install project dependencies at the root so shared packages like
# `govuk-frontend` are available from /usr/src/app/node_modules at runtime.
# Run as root to avoid permission issues during install, switch to the
# non-root user later for build/run steps.
USER 1001

# ----------------------------
# Stage 3
# Base with model stage
# In this layer we build the model workspace.
# It will re-run only if anything inside ./model changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM dependencies AS model
WORKDIR /usr/src/app
#TODO:- remove - should already be copied in s2
COPY --chown=appuser:appuser ./model ./model/
USER 1001
RUN yarn workspaces focus @xgovformbuilder/model && yarn model build

# ----------------------------
# Stage 4
# Build stage
# In this layer we build the runner workspace
# It will re-run only if anything inside ./runner changes, otherwise this stage is cached.
# rsync is used to merge folders instead of individually copying files
FROM model AS build-runner
WORKDIR /usr/src/app
ARG LAST_COMMIT
ARG LAST_TAG
ENV LAST_COMMIT=$LAST_COMMIT
ENV LAST_TAG=$LAST_TAG
COPY --chown=appuser:appuser ./runner ./runner/
# copy the runner workspace and keep its ecosystem.config.js inside the runner folder
# avoid copying it to /usr/src/app/ecosystem.config.js to prevent ambiguity between multiple configs
RUN yarn workspaces focus @xgovformbuilder/runner && yarn runner rebuild
RUN yarn runner build
# ensure the built runner dist is available at /usr/src/app/dist as well
# some runtime configs or older ecosystem files expect /usr/src/app/dist/index.js
# create a symlink so both paths point to the same built output
RUN if [ -d /usr/src/app/runner/dist ]; then ln -sfn /usr/src/app/runner/dist /usr/src/app/dist; fi
USER 1001
EXPOSE 3009
COPY --chown=appuser:appuser ./runner/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["/usr/local/bin/docker-entrypoint.sh"]

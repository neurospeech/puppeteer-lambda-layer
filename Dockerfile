ARG FUNCTION_DIR="/function"

# Build Stage 1: Install aws-lambda-ric dependencies, npm install package.json dependencies
FROM node:20-buster-slim
# Include global arg in this stage of the build
ARG FUNCTION_DIR
# AWS Lambda runtime dependencies
RUN apt-get update && \
    apt-get install -y \
        g++ \
        make \
        unzip \
        libcurl4-openssl-dev \
        autoconf \
        libtool \
        cmake
# Copy function code
RUN mkdir -p ${FUNCTION_DIR}/

WORKDIR ${FUNCTION_DIR}

RUN apt-get update \
    && apt-get install -y x11-apps python3\
    && apt-get install -y wget gnupg chromium mesa-va-drivers libva-drm2 libva-x11-2 mesa-utils mesa-utils-extra nodejs npm fonts-noto-color-emoji\
    && apt-get update \
    && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir /var/ffmpeg && cd /var/ffmpeg
RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    tar xvf ./ffmpeg-release-amd64-static.tar.xz --one-top-level=ffmpeg2 --strip-components 1 && \
    mv ${FUNCTION_DIR}/ffmpeg2 ${FUNCTION_DIR}/ffmpeg

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm install aws-lambda-ric

# # Build Stage 2: Copy Build Stage 1 files in to Stage 2. Install chromium dependencies and chromium.
# FROM ackava/node-chrome-ffmpeg:latest
# # Include global arg in this stage of the build
# ARG FUNCTION_DIR
# # Set working directory to function root directory
# WORKDIR ${FUNCTION_DIR}
# # Copy in the build image dependencies
# COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}
# RUN ls ${FUNCTION_DIR}

ENV HOME="/tmp"

COPY dist ${FUNCTION_DIR}/dist
COPY package.json ${FUNCTION_DIR}
COPY src ${FUNCTION_DIR}/src
COPY index.js ${FUNCTION_DIR}
COPY node_modules ${FUNCTION_DIR}/node_modules
COPY puppeteer-chromium ${FUNCTION_DIR}/puppeteer-chromium

# RUN cp /var/ffmpeg ${FUNCTION_DIR}/ffmpeg -r

WORKDIR ${FUNCTION_DIR}

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD [ "index.handler" ]

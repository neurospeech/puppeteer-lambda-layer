FROM public.ecr.aws/lambda/nodejs:18-x86_64

RUN apt-get update \
    && apt-get install -y wget gnupg chromium mesa-va-drivers libva-drm2 libva-x11-2 mesa-utils mesa-utils-extra \
    && apt-get update \
    && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY dist ${LAMBDA_TASK_ROOT}/dist
COPY package.json ${LAMBDA_TASK_ROOT}
COPY src ${LAMBDA_TASK_ROOT}/src
COPY index.js ${LAMBDA_TASK_ROOT}
COPY node_modules ${LAMBDA_TASK_ROOT}/node_modules

CMD [ "index.handler" ]
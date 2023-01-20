FROM public.ecr.aws/lambda/nodejs:18-x86_64

COPY dist ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}
COPY src ${LAMBDA_TASK_ROOT}
COPY index.js ${LAMBDA_TASK_ROOT}
COPY node_modules ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]
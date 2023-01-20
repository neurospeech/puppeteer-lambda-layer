FROM public.ecr.aws/lambda/nodejs:18-x86_64

# RUN yum install wget curl -y
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
# RUN yum install ./google-chrome-stable_current_*.rpm -y

RUN amazon-linux-extras install epel -y
RUN yum install -y chromium

COPY dist ${LAMBDA_TASK_ROOT}/dist
COPY package.json ${LAMBDA_TASK_ROOT}
COPY src ${LAMBDA_TASK_ROOT}/src
COPY index.js ${LAMBDA_TASK_ROOT}
COPY node_modules ${LAMBDA_TASK_ROOT}/node_modules

CMD [ "index.handler" ]
FROM public.ecr.aws/lambda/nodejs:18

ENV LANG=en_US.UTF-8
ENV TZ=:/etc/localtime
ENV PATH=/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin
ENV LD_LIBRARY_PATH=/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib
ENV LAMBDA_TASK_ROOT=/var/task
ENV LAMBDA_RUNTIME_DIR=/var/runtime

WORKDIR /var/task

COPY dist /var/task/dist
COPY package.json /var/task/pacakge.json
COPY src /var/task/src
COPY index.js /var/task/index.js
COPY node_modules /var/task/node_modules


ENTRYPOINT ["/lambda-entrypoint.sh"]
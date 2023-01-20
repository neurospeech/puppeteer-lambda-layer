FROM scratch
ADD x86_64/1b32773f26c1989280ccaeb523350db64849dd69b5d97ff91d54d35ee47384a2.tar.xz /
ADD x86_64/28c33bea9cc8eda1bfb7c7a13a58550c0e26f45b23e164b467591fb68ebf7a03.tar.xz /
ADD x86_64/81072ae89ebc9f2c33954efc205bada1bea4435f2915fdd1c1310b7a5fd6ec19.tar.xz /
ADD x86_64/8908bbd9111ab9373ef7708fc223d9f14514ff864450ee57e0bc1783753cefdb.tar.xz /
ADD x86_64/de20e53177fe1a123011f535ea58fce70b8367e0d8ac7df636259a77083239d5.tar.xz /
ADD x86_64/e98d4755f1a59f348fdee837bdb1be79dd32623be54f8831b19ea908bc444258.tar.xz /

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
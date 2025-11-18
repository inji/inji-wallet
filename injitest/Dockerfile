FROM mosipid/openjdk-21-jre:21.0.4

# Define build-time arguments
ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME

# Set labels for metadata
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

# Define build-time arguments for user and group
ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1001
ARG container_user_gid=1001
ARG KUBECTL_VERSION=1.22.9

# Set working directory for the user
WORKDIR /home/${container_user}/
ENV work_dir=/home/${container_user}/

# Copy files
COPY ./injitest/target $work_dir/
COPY application.properties $work_dir/
COPY ["Biometric Devices", "$work_dir/Biometric Devices"]
COPY ["resource", "$work_dir/resource"]
COPY testNgXmlFiles $work_dir/testNgXmlFiles
COPY androidConfig.yml $work_dir/
COPY iosConfig.yml $work_dir/
COPY entrypoint.sh $work_dir

# install packages and create user
RUN apt-get -y update \
&& apt-get install -y unzip jq curl \
&& groupadd -g ${container_user_gid} ${container_user_group} \
&& useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/bash -m ${container_user} \
&& curl --proto '=https' --proto-redir '=https' -LO "https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl" \
&& mkdir -p /home/${container_user} \
&& chmod +x kubectl $work_dir/entrypoint.sh \
&& mv kubectl /usr/local/bin/ \
&& chown -R ${container_user}:${container_user} /home/${container_user} /etc/ssl/certs/java/cacerts \
&& chmod 644 /etc/ssl/certs/java/cacerts

# Switch to the specified user for the subsequent commands
USER ${container_user_uid}:${container_user_gid}

# Create necessary directories
RUN mkdir -p /home/mosip/test-output && chmod -R 777 /home/mosip/test-output
RUN mkdir -p /home/mosip/screenshots && chmod -R 777 /home/mosip/screenshots

# Expose port if needed
EXPOSE 8083

# Environment variables
ENV MODULES=
ENV ENV_USER=
ENV ENV_ENDPOINT=
ENV ENV_TESTLEVEL=smokeAndRegression
ENV ENV_TESTNG_XML_FILE=
ENV ENV_BROWSERSTACK_CONFIG=

ENTRYPOINT ["./entrypoint.sh"]

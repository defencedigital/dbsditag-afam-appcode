FROM debian:11

ENV DEBIAN_FRONTEND=noninteractive

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN apt-get update \
    && apt-get -y install --no-install-recommends apt-utils dialog 2>&1 \
    && apt-get install -y \
    bash-completion git openssh-client less curl fd-find ripgrep procps \
    unzip apt-transport-https ca-certificates gnupg-agent software-properties-common \
    python3-pip jq uuid-runtime lsb-release 2>&1
RUN curl -fsSL https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/gpg | apt-key add - 2>/dev/null \
    && add-apt-repository "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]') $(lsb_release -cs) stable" \
    && apt-get update \
    && apt-get install -y docker-ce-cli
RUN curl -L https://github.com/wallix/awless/releases/download/v0.1.11/awless-linux-amd64.tar.gz  | tar -xz -C /usr/local/bin/
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME
RUN echo "alias fd=fdfind" >> /home/${USERNAME}/.bashrc
RUN curl -fsSL https://starship.rs/install.sh | sh -s -- --yes \
    && echo 'eval "$(starship init bash)"' >> /home/$USERNAME/.bashrc \
    && echo 'source <(awless completion bash)' >> /home/$USERNAME/.bashrc
RUN apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME\
    && chmod 0440 /etc/sudoers.d/$USERNAME
RUN type -p curl >/dev/null || apt install curl -y \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update && apt-get -y install --no-install-recommends apt-utils dialog 2>&1 gh
COPY --chown=${USER_UID}:${USER_GID} "binaries/oc-4.11.5-linux.tar.gz" "/tmp/oc.tar.gz"
RUN cd /tmp && tar xvzf "/tmp/oc.tar.gz" && mv oc /bin/oc
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*
RUN pip3 install bpytop
ENV DEBIAN_FRONTEND=dialog
ENV EDITOR=code
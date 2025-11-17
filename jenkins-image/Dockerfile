FROM jenkins/jenkins:lts-jdk17

# Pre-install minimal plugins to avoid network/download at init time
# Keep list small to improve reliability on limited networks.
RUN jenkins-plugin-cli --plugins \
    git \
    configuration-as-code \
    workflow-aggregator


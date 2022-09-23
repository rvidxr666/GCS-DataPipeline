# Debian 11 is recommended.
FROM continuumio/miniconda3

# Suppress interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# (Required) Install utilities required by Spark scripts.
RUN apt-get update && apt-get install -y procps tini

# Set env variables
ENV CONDA_HOME=/opt/conda
ENV PYSPARK_PYTHON=${CONDA_HOME}/bin/python
ENV PATH=${CONDA_HOME}/bin:${PATH}

# Install Conda packages.
RUN ${CONDA_HOME}/bin/conda install nomkl pandas && conda clean -afy
# Copy code in the container
COPY processCrypto.py /job/processCrypto.py

# (Required) Create the 'spark' group/user.
# The GID and UID must be 1099. Home directory is required.
RUN groupadd -g 1099 spark
RUN useradd -u 1099 -g 1099 -d /home/spark -m spark
USER spark

ENTRYPOINT ["/job/processCrypto.py"]
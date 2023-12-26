FROM pulumi/pulumi-python

RUN python -m venv ./venv
RUN python -m pip install --upgrade pip setuptools wheel

COPY Pulumi.yaml requirements.txt __main__.py ./

ENV PULUMI_CONFIG_PASSPHRASE="passphrase"

RUN venv/bin/pip install -r requirements.txt

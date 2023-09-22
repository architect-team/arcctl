FROM pulumi/pulumi-python

RUN python -m venv ./venv
RUN python -m pip install --upgrade pip setuptools wheel

COPY Pulumi.dev.yaml Pulumi.yaml requirements.txt __main__.py ./

RUN venv/bin/pip install -r requirements.txt

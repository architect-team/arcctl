import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()

secret_name = config.require("name").replace("/", "-")
if config.get("namespace"):
  secret_name = "{}-{}".format(config.require("namespace"), secret_name)

secret = gcp.secretmanager.Secret("secret",
                                  replication=gcp.secretmanager.SecretReplicationArgs(
                                    automatic=True
                                  ),
                                  secret_id=secret_name)

secret_version = gcp.secretmanager.SecretVersion("version", 
                                                 secret=secret.id,
                                                 secret_data=config.require("data"))

pulumi.export("id", secret.id)
pulumi.export("data", secret_version.secret_data)

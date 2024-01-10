import pulumi
import pulumi_gcp as gcp
import json
import os
import uuid

inputs = os.environ.get("INPUTS")
if (inputs == None):
  raise Exception("Missing configuration. Please provide it via the INPUTS environment variable.")

config = json.loads(inputs)

provider = gcp.Provider("provider", 
                        project=config["project"],
                        region=config["region"], 
                        credentials=config["credentials"])

project_service = gcp.projects.Service("database-service",
                               disable_on_destroy=False,
                               service="sqladmin.googleapis.com",
                               opts=pulumi.ResourceOptions(provider=provider))

password = uuid.uuid4()

sql_user = gcp.sql.User("user", 
                        name=config["name"], 
                        instance=config["cluster_id"],
                        password=password.hex, 
                        deletion_policy="ABANDON", 
                        opts=pulumi.ResourceOptions(provider=provider,depends_on=[project_service]))

pulumi.export("id", sql_user.name)
pulumi.export("username", sql_user.name)
pulumi.export("password", sql_user.password)

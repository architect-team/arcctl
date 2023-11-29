import pulumi
import pulumi_gcp as gcp
import uuid

config = pulumi.Config()

project_service = gcp.projects.Service("database-service",
                               disable_on_destroy=False,
                               service="sqladmin.googleapis.com")

password = uuid.uuid4()

sql_user = gcp.sql.User("user", 
                        name=config.require("name"), 
                        instance=config.require('cluster_id'),
                        password=password.hex, 
                        # instance=instance_name,
                        deletion_policy="ABANDON", 
                        opts=pulumi.ResourceOptions(depends_on=[project_service]))

pulumi.export("id", sql_user.name)
pulumi.export("username", sql_user.name)
pulumi.export("password", sql_user.password)

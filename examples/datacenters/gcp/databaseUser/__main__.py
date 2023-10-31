import pulumi
import pulumi_gcp as gcp
import uuid

config = pulumi.Config()

project_service = gcp.projects.Service("database-service",
                               disable_on_destroy=False,
                               service="sqladmin.googleapis.com")

database = config.require('database')
[protocol, instance_name, database_name, host, port] = database.split("/")

password = uuid.uuid4()

sql_user = gcp.sql.User("user", 
                        name=config.require("username"), 
                        password=password.hex, 
                        instance=instance_name,
                        deletion_policy="ABANDON", 
                        opts=pulumi.ResourceOptions(depends_on=[project_service]))

pulumi.export("id", sql_user.name)
pulumi.export("username", sql_user.name)
pulumi.export("password", sql_user.password)
pulumi.export("host", host)
pulumi.export("port", port)
pulumi.export("protocol", protocol)
pulumi.export("url", pulumi.Output.format("{}://{}:{}@{}:{}/{}", protocol, sql_user.name, sql_user.password, host, port, database_name))
pulumi.export("database", database_name)

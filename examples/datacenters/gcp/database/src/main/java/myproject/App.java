package myproject;

import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.gcp.projects.Service;
import com.pulumi.gcp.projects.ServiceArgs;
import com.pulumi.gcp.sql.Database;
import com.pulumi.gcp.sql.DatabaseArgs;
import com.pulumi.resources.CustomResourceOptions;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var config = ctx.config();

            var projectService = new Service("database-service", ServiceArgs.builder()        
                .service("sqladmin.googleapis.com")
                .disableOnDestroy(false)
                .build());

            var databaseClusterParts = config.require("databaseCluster").split("/", 0);
            var protocol = databaseClusterParts[0];
            var instanceName = databaseClusterParts[1];
            var host = databaseClusterParts[2];
            var port = databaseClusterParts[3];

            var normalizedName = config.require("name").replaceAll("/", "--");

            var database = new Database("sql-database", DatabaseArgs.builder()  
                .name(normalizedName)      
                .instance(instanceName)
                .deletionPolicy("ABANDON")
                .build(), 
                CustomResourceOptions.builder()
                .dependsOn(projectService)
                .build());

            ctx.export("id", Output.format("%s/%s/%s/%s/%s", protocol, instanceName, database.name(), host, port));
            ctx.export("name", database.name());
            ctx.export("host", Output.of(host));
            ctx.export("port", Output.of(port));
            ctx.export("username", Output.of(""));
            ctx.export("password", Output.of(""));
            ctx.export("protocol", Output.of(protocol));
            ctx.export("url", Output.format("%s://%s:%s/%s", protocol, host, port, database.name()));
        });
    }
}

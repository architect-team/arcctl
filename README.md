<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.architect.io/logo/horizontal-inverted.png"/>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.architect.io/logo/horizontal.png"/>
    <img width="320" alt="Architect Logo" src="https://cdn.architect.io/logo/horizontal.png"/>
  </picture>
  <br>
</h1>

<h4 align="center">
  Next-generation CI/CD automation to help developers deploy any app, anywhere.
</h4>

<p align="center">
  <a href="./LICENSE.md">
    <img alt="GitHub" src="https://img.shields.io/github/license/architect-team/arcctl">
  </a>
</p>

<p align="center">
  <a href="#what-is-architect">What is Architect?</a> •
  <a href="#install">Install</a> •
  <a href="#for-developers">Getting started: Developers</a> •
  <a href="#for-platform-engineers">Getting started: Platform engineers</a>
</p>

## What is Architect?

Architect is a next-gen toolset that helps teams automate CI/CD for their entire organization. It takes the best of infrastructure-as-Code (IaC), like declarative configuration, execution plans, resource graphs, and change automation, and splits it into a pair of sibling frameworks: the [Component framework](./src/components) to allow developers to design, develop, and integrate cloud-native applications, and the [Datacenter framework](./src/datacenters/) to allow Platform Engineers to control how applications should behave in their cloud.

## Install

### MacOS / Linux

```sh
$ curl -sSL https://arcctl-backend.nyc3.digitaloceanspaces.com/arcctl --output arcctl && chmod +x ./arcctl && mv ./arcctl /usr/local/bin/
```

### Windows

```sh
$ curl -sSL https://arcctl-backend.nyc3.digitaloceanspaces.com/arcctl --output arcctl && chmod +x ./arcctl && mv ./arcctl /usr/local/bin/
```

## For Developers

For developers, infrastructure and CI/CD is a nuisance. Once it "works on my machine", cloud applications should be able to run anywhere. Docker and containers have made that true for application runtimes, but developers still spend too much time writing CI workflows and IaC templates. That's why we created the [component framework](./src/components/).

Components are application bundles that can be run anywhere and always deploy everything they need to run. Creating a component doesn't require developers to learn any cloud infrastructure, and instead focuses on the details they already know about their applications: What database(s) does it need? What APIs does it connect to? What APIs does it expose, and more. By cataloging the application's _dependencies_, Architect is able to guarantee the existance of those dependencies every time the component is deployed. If they can't be found, Architect will deploy those too!

### Key features

* Local development environments
* On-demand test environments (aka. feature/preview/ephermeral environments)
* Recursive delivery – automatically deploy component dependencies into fresh environments
* No need to learn infrastructure or CI pipelines

### Getting Started

The best way to get a taste of what Architect is all about is to deploy a component, but there are a few steps needed to get your local environment setup before we can do that (most of which you'll only need to do once). Once you've gotten started all you need to do is deploy!

1. [Create your first datacenter](#1-create-your-first-datacenter)
2. [Create an environment](#2-create-an-environment)
3. [Deploy](#3-deploy)
4. [Bonus: Dev environments](#bonus-dev-environments)

#### 1. Create your first datacenter

Platform, DevOps, and infrastructure teams can have all sorts of requirements for how applications need to behave inside their environments. This is why we created the [datacenters framework](./src/datacenters). This is mostly noise for developers who just want to focus on their app though, so we've create a set of example datacenters you can use to get started.

The datacenter schema used below doesn't use a cloud provider at all. Instead, it runs your applications using docker for deployments and databases, traefik for your API gateway and service mesh, and the local filesystem to store secrets. That means it won't cost you a dime to run the applications and the data never leaves your device:

```sh
$ arcctl apply datacenter local https://raw.githubusercontent.com/architect-team/arcctl/main/examples/datacenters/local.yml
```

Datacenters are designed to be a home for many environments, now and in the future. You can leave your datacenter running indefinitely to make it easier to create new test environments.

#### 2. Create an environment

Once you've created a datacenter, you'll need to create an [environment](./src/environments) that you can deploy into. Environments are basically namespaces that can allow datacenters to power more than one environment (popular for non-production use cases). Go ahead and create one on the datacenter you just created:

```sh
$ arcctl create environment my-env --datacenter local
```

#### 3. Deploy

Finally we can test out deploying a component! We've curated a sample application designed to show off the power of dependencies, [architect-team/auth-example](https://github.com:architect-team/auth-example). This component is a full-stack web application that connects our [Ory Kratos component](https://github.com/architect-team/kratos-selfservice-ui-node) to handle user registration and login, which in turn connects to our [Mailslurper component](https://github.com/architect-team/mailslurper) to handle SMTP for email verification. The component architecture looks a bit like this:

```
[Auth example] --> [Ory Kratos] --> [Mailslurper]
```

The beauty of Architect's dependency management feature is that each component is responsible for its own portion of the architecture. They can declare their own databases, volumes, deployments, and more, while the components that depend on them don't have to worry about any of the details. That means you can just deploy the auth example and Architect will take care of deploying and integrating the other two components:

```sh
$ git clone git@github.com:architect-team/auth-example.git
$ cd auth-example
$ arcctl deploy . --environment my-env
```

Once you press enter, you'll immediately be shown a table-view of every individual cloud resource Architect identified that is required by your deployment. You'll be prompted to approve the changes to the environment, and then arcctl will get started landing the changes. 

Once its done (speed will vary based on the datacenter configuration), you'll be able to navigate to the URLs associated with each ingressRule:

```sh
  Name                                         Type             Component                Environment  Action  Status    Time                                                
  service-registry                             volume                                                 no-op   complete  0s                                                  
  gateway                                      deployment                                             no-op   complete  0s                                                  
  local-gateway                                arcctlAccount                                          no-op   complete  0s                                                  
  pg                                           databaseCluster                           local        create  complete  0s                                                  
  local-postgres-db                            arcctlAccount                             local        create  complete  0s                                                  
  frontend                                     dockerBuild      ebbd092d354f             local        create  complete  5s                                                  
  main                                         database         ebbd092d354f             local        create  complete  1s                                                  
  frontend-app                                 volume           ebbd092d354f             local        create  complete  0s                                                  
  frontend-public                              volume           ebbd092d354f             local        create  complete  0s                                                  
  frontend-prisma                              volume           ebbd092d354f             local        create  complete  0s                                                  
  ebbd092d354f/deployment/frontend/main        databaseUser     ebbd092d354f             local        create  complete  1s                                                  
  frontend                                     deployment       ebbd092d354f             local        create  complete  0s                                                  
  frontend                                     service          ebbd092d354f             local        create  complete  0s                                                  
  app                                          ingressRule      ebbd092d354f             local        create  complete  0s    http://app.local.127.0.0.1.nip.io/            
  mailslurper                                  deployment       architectio/mailslurper  local        create  complete  2s                                                  
  smtp                                         service          architectio/mailslurper  local        create  complete  0s                                                  
  mailslurper                                  service          architectio/mailslurper  local        create  complete  0s                                                  
  mailslurper-api                              service          architectio/mailslurper  local        create  complete  0s                                                  
  mailslurper                                  ingressRule      architectio/mailslurper  local        create  complete  0s    http://mailslurper.local.127.0.0.1.nip.io/    
  mailslurper-api                              ingressRule      architectio/mailslurper  local        create  complete  0s    http://mailslurper-api.local.127.0.0.1.nip.io/
  allowed_return_urls                          secret           architectio/kratos       local        create  complete  0s                                                  
  kratos                                       database         architectio/kratos       local        create  complete  2s                                                  
  architectio/kratos/deployment/kratos/kratos  databaseUser     architectio/kratos       local        create  complete  1s                                                  
  kratos                                       deployment       architectio/kratos       local        create  complete  1s                                                  
  ui                                           deployment       architectio/kratos       local        create  complete  0s                                                  
  kratos-public                                service          architectio/kratos       local        create  complete  0s                                                  
  kratos-admin                                 service          architectio/kratos       local        create  complete  0s                                                  
  frontend                                     service          architectio/kratos       local        create  complete  0s                                                  
  kratos-public                                ingressRule      architectio/kratos       local        create  complete  0s    http://kratos-public.local.127.0.0.1.nip.io/  
  auth                                         ingressRule      architectio/kratos       local        create  complete  0s    http://auth.local.127.0.0.1.nip.io/
```

#### Bonus: Dev environments

Want to quickly test your components and application code? We've got you covered! Just run `arcctl up .` in the directory your component lives in and specify a datacenter to power your environment. Architect will automatically create an environment, deploy the component to it in debug mode, and then stream the application logs to your terminal. Yes, this is just like docker-compose!

```sh
$ arcctl up . --datacenter local
```

## For Platform Engineers

Creating a strong internal developer platform takes time and experience to do right. Once you create one golden path, like workflows and IaC templates for a Java monolith, developers quickly ask for more. They ask for things like microservices, event-driven architecture, ephemeral environments, logging, observability, and the list just keeps growing. If that wasn't enough, you still have the other half of your job to do: managing costs, keeping things secure, evaluating tools like gateways, service meshes, secret managers, and more. That's why we created the [Datacenters framework](./src/datacenters/) – to help platform engineers offer the developer benefits of [components](./src/components)

Datacenters are packages of configuration and rules dictating how cloud resources should behave. They allow platform engineers to specify resources that should live inside every cloud environment to support multi-tenancy (e.g. namespaces, scoped databases, messaging queues, etc), as well rules for how application resources should behave when they land (e.g. where do secrets get stored, where should container workloads be run, etc). The ability to codify these rules allows platform teams to offer true self-service to developers without loosing control of their cloud. Developers can create their own environments and deploy w/out worrying about infrastructure or workflows, and platform teams can intrument, monitor, and scale cloud infrastructure w/out worrying about applications or developers. 

### Key features

* Give developers the power to create their own on-demand environments
* Automate zero-trust security for every application (both networking and credentials)
* Experiment with and swap out key tools (like gateways, service meshes, secret managers, and more) without needing to coordinate with developers
* Built on top of a tool you already know and trust: Terraform

### Getting started

#### 1. Create a few datacenters

Every datacenter you create becomes something that you or your team can create and run cloud environments on top of. We've created a few sample datacenters templates for you to try, but they all use our [datacenters framework](./src/datacenters/) which means you're able to tweak them or create entirely new ones.

_Note: the second two datacenters both use Google Cloud. You'll be prompted to setup credentials which you can learn how to do by checking out the [GCP provider docs](./src/@providers/gcp/README.md)._

```sh
# A datacenter that runs components locally
$ arcctl apply datacenter local https://raw.githubusercontent.com/architect-team/arcctl/main/examples/datacenters/local.yml

# A datacenter that runs workloads on GCP Cloud Run
$ arcclt apply datacenter gcp-serverless https://raw.githubusercontent.com/architect-team/arcctl/main/examples/datacenters/gcp-serverless.yml

# A datacenter that creates a new k8s cluster to host workloads
$ arcctl apply datacenter gcp-k8s https://raw.githubusercontent.com/architect-team/arcctl/main/examples/datacenters/gcp.yml
```

#### 2. Create an environment in each datacenter

Environments are a practical way for you to offer your developers a way to deploy into shared namespaces. When components are deployed to the same environment, they'll automatically use existing components to fulfill dependency claims instead of re-deploying. This is great for collaboration amongst your stakeholders.

Let's go ahead and create an environment in each datacenter. Note that each datacenter may need different resources to exist per-environment – something that is also controllable as part of the [datacenters framework](./src/datacenters):

```sh
$ arcctl create environment local --datacenter local
$ arcctl create environment serverless --datacenter gcp-serverless
$ arcctl create environment k8s --datacenter gcp-k8s
```

#### 3. Deploy!

Finally, you're ready to deploy! Components are portable across ANY datacenter, so you don't even really need to know what's inside a component in order to deploy it. As a datacenter author, you have full control over how application resources behave within the environment thanks to the [`hooks`](./src/datacenters/v1#resource-hooks) feature of datacenters.

Components get published to any OCI-compliant registry (e.g. dockerhub) so you can deploy them as if they were docker containers:

```sh
$ arcctl deploy architectio/auth-example:latest --environment local
$ arcctl deploy architectio/auth-example:latest --environment serverless
$ arcctl deploy architectio/auth-example:latest --environment k8s
```

## State management

Architect uses persisted state to keep track of your accounts, datacenters and environments. These statefiles represent all of your cloud resources. By default these statefiles are kept on your local machine. Though, if you want to share these resources with multiple people across machines, then you will need to use a remote state. Any provider that supports a secret resource type, can be used as a remote backend.

To configure a remote backend you can run the command, which will run you through creating an account.
```
$ arcctl set state.backend
```

To use arcctl in CI flows you can automate the configuration process. The following is an example of using DigitalOcean Spaces.
```
$ arcctl set state.backend --cred accessKeyId=myAccessKeyId --cred secretAccessKey=mySecretAccessKey --cred endpoint=https://nyc3.digitaloceanspaces.com --cred region=nyc3 --provider s3 --namespace=mybucket
```

### Managed Secrets

Once you configure a new backend, ArcCtl will use that to store any stateful information from the commands you run. At the moment we store 3 secrets.

| Name         | Description                                                                                                               |
|--------------|---------------------------------------------------------------------------------------------------------------------------|
| providers    | A list of all accounts that have been added either through `arcctl add account` or dynamically through resource creation. |
| datacenters  | A list of all managed datacenters and their current state.                                                                |
| environments | A list of all managed environments and their current state.

These secrets contain senesitive information such as account credentials and terraform state files, so it is highly recommended to restrict who has access to these secrets.

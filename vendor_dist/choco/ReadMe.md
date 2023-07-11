# Chocolatey Release System

This folder contains all the necessary tools in order to release a new version of `arcctl` with Chocolatey.

## Update Version
To update the version you will need to change 2 lines.
### Automatic
```
ARCCTL_VERSION=v0.0.3 bash upgrade_version.sh
```
### tools/chocolateyinstall.ps1
This is the version that gets downloaded from the github release page.
Update the line
```
$version = 'v0.0.2'
```
### arcctl.nuspec
This is the version that will appear on choco.
Update the line
```
<version>0.0.1</version>
```

## Pack
```
docker run --rm -it -v ./:/arcctl chocolatey/choco:latest-linux choco pack /arcctl/arcctl.nuspec --outputdirectory /arcctl
```
This will produce the file `arcctl.0.0.1.nupkg` which can be published.

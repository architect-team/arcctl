$packageName= 'arcctl'
$version = "v0.0.3"
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url        = "https://github.com/mueschm/denotest2/releases/download/$version/arcctl-windows-$version.exe"


Get-ChocolateyWebFile -PackageName 'arcctl' -FileFullPath "$toolsDir/arcctl.exe" -Url "$url"

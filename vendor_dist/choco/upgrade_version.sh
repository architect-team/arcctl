if [[ ! -v ARCCTL_VERSION ]]; then
    echo "You must set ARCCTL Version"
    exit 1
else
    echo "Using VERSION ${ARCCTL_VERSION}"
fi
sed -i "s/\$version = .*/\$version = \"${ARCCTL_VERSION}\"/g" tools/chocolateyinstall.ps1
sed -i "s/<version>.*/<version>${ARCCTL_VERSION}<\/version>/g" arcctl.nuspec

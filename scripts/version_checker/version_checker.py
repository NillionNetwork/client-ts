# Checks npm package version
# Based on https://github.com/maybe-hello-world/pyproject-check-version/blob/v4/version_checker.py
import sys
import os
import requests
from packaging import version
from packaging.version import Version
import json
import re


def get_public_version(package_name: str, dist_tag: str) -> Version:
    response = requests.get(f"https://registry.npmjs.org/{package_name}")
    if response.status_code == 200:
        return version.parse(json.loads(response.content)["dist-tags"][dist_tag])
    else:
        return Version("0.0")


def main():
    npmjs_package = sys.argv[1]
    with open(f"{npmjs_package}/package.json", "rb") as f:
        package_info = json.load(f)
        f.close()

    pattern = re.compile(r"(\d+\.\d+\.\d+)(-rc.(\d+))?")

    version_info = pattern.fullmatch(package_info["version"])
    if not bool(version_info):
        raise Exception(f"{npmjs_package} version is not valid")
    dist_tag = "latest"
    if version_info.group(3):
        dist_tag = "next"

    package_version = version.parse(package_info["version"])
    public_package_version = get_public_version(package_info["name"], dist_tag)

    with open(os.environ["GITHUB_OUTPUT"], "at") as f:
        f.write(
            f"local_version_is_higher={str(package_version > public_package_version).lower()}\n"
        )
        f.write(f"local_version={str(package_version)}\n")
        f.write(f"public_version={str(public_package_version)}\n")
        f.write(f"tag={str(dist_tag)}\n")


if __name__ == "__main__":
    main()

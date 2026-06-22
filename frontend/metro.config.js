const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const exclusionListModule = require("metro-config/private/defaults/exclusionList");
const exclusionList = exclusionListModule.default || exclusionListModule;

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const ignoredPaths = [
  path.join(projectRoot, ".expo"),
  path.join(projectRoot, "dist"),
  path.join(projectRoot, "build"),
  path.join(projectRoot, "android"),
  path.join(projectRoot, "ios"),
];

config.resolver.blockList = exclusionList(
  ignoredPaths.map((ignoredPath) => new RegExp(`${escapePath(ignoredPath)}(/.*)?$`)),
);

config.watchFolders = [path.join(projectRoot, "src"), path.join(projectRoot, "assets")];

function escapePath(filePath) {
  return filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = config;

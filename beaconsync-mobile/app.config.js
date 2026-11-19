const { execFileSync } = require("node:child_process");

function consultarGit(argumentos) {
  try {
    return execFileSync("git", argumentos, {
      cwd: __dirname,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}

module.exports = ({ config }) => {
  const candidato =
    process.env.EAS_BUILD_GIT_COMMIT_HASH ||
    consultarGit(["rev-parse", "HEAD"]);

  const commit =
    candidato && /^[a-f0-9]{40,64}$/i.test(candidato)
      ? candidato
      : null;

  return {
    ...config,

    extra: {
      ...config.extra,

      sobre: {
        commit,
      },
    },
  };
};
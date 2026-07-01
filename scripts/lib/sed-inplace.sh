# shellcheck shell=bash
# Portable sed -i for macOS (BSD) and Linux (GNU).
sed_inplace() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

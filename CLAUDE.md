# Project instructions

## Temporary files

- Put every temporary or scratch file in `temp/` at the project root (`/mnt/Data/Projects/ganabanao/temp/`). This includes test scripts, env files, logs, downloads and extracted specs. The folder is git-ignored.
- Never use `/tmp` or the session scratchpad directory for this project, even if the session suggests it.
- In shell commands, use literal paths inside the project. Never put a path outside the project in a shell variable (e.g. `S=/tmp/...`), because those commands trigger a permission prompt every time.
- Keep commands small. Run `pkill`, `rm -rf` and other destructive commands on their own, not chained with other commands.

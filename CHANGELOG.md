# 1.0.0
- Initial Release
### 1.0.1
- Fixed a bug that made the `__dirname` variable un-usable on Windows based machines.
### 1.0.2
- Fixed a bug that would sometimes crash the bot due to trying to reply to an "Unknown" Interaction.
- Added a disclaimer in the README.
- Command ID's are now logged at startup after loading.
## 1.1.0
- Added `/rate` command to let players share their opinions of others sort of like a feedback.
- Added `/tickets` command to count ticket activity. (Be wary as it is hardcoded with a lot of values)
- Reworked command categories in `/help`.
- Re-worked cooldowns so now staff (defined by role IDs in config) can have a different command cooldown.
- Added new config options.
- Removed `config.json5`, added `example_config.json5` instead.
- Added `example_badWords.json5`, in the same manner as the config/example config file.
- Updated README to accommodate new changes.
- Footer text for all bot embeds is now configurable from the config file.
- Added cleanup script.
- Fixed a lotta bugs.
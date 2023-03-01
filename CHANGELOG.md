# 1.0.0
- Initial Release
### 1.0.1
- Fixed a bug that made the `__dirname` variable un-usable on Windows based machines.
### 1.0.2
- Fixed a bug that would sometimes crash the bot due to trying to reply to an "Unknown" Interaction.
- Added a disclaimer in the README.
- Command ID's are now logged at startup after loading.
## 1.1.0
- Added `/opinion` command to let players share their opinions of others sort of like a feedback.
- Reworked command categories in `/help`.
- Added an `ignore_cooldown` property in the config, it is a role ID that makes the bot assume a `1s` cooldown for all commands for people with that role no matter the actual command cooldown.
- Fixed some bugs.
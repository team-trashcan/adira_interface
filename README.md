# Talking Trashcan

This is the Discord bot for our chatbot project.

## Setup

Install necessary dependencies:

```sh
npm i
```

Add a `.env` file with the bot token and client id (retrieved from the [Discord Developer Portal](https://discord.com/developers/applications/1285909172403310653)):

```env
DISCORD_TOKEN=xxxxx
DISCORD_CLIENT_ID=00000
FORCE_RELOAD_COMMANDS=false
```

## Development

To run the bot:

```sh
npm run run
```

To restart it everytime something changes in the code:

```sh
npm run dev
```

### Force Reload / Commands

This is only necessary if a new command is added or the desription of one is changed.\
To reload the `/` commands, set the `.env` variable `FORCE_RELOAD_COMMANDS` to `true`.

## Production

To compile for production:

```sh
npm run build
```

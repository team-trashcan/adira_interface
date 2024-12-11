# Adira Interface

This is the Discord bot for our chatbot project.

## Production

Pull the Docker Image from the GitHub Container Registry:

```console
docker pull ghcr.io/team-trashcan/adira_interface:latest
```

These environment variables are needed (obtained through the [Discord Developer Portal](https://discord.com/developers/applications)):

`DISCORD_BOT_TOKEN`: The bot token, equal to the bot's password \
`DISCORD_BOT_CLIENT_ID`: The client id of the bot, encased in quotation marks

Example:

```console
DISCORD_BOT_TOKEN=MHL4NZkwOTL3MjQwMzMxMDY1Mw.KmUmVh.ap4wOPACYZGNKBHbeH4rcuc164mX3CS-taY9XM
DISCORD_BOT_CLIENT_ID="3255909182403310038"
```

## Development

### Setup

Install necessary dependencies:

```console
npm i
```

Add a `config/development.yaml` file with the bot token and client id (obtained through the [Discord Developer Portal](https://discord.com/developers/applications)):

```yaml
app:
  bot:
    discordToken: xxxxx
    discordClientId: xxxxx
    forceReloadCommands: false
```

### Logging

The bot only logs errors and warnings by default.\
To enable debug logging, either set the environment variable `DISCORD_BOT_LOG_LEVEL` or `app.debug.logLevel` in `config/development.yaml` to `DEBUG`

### Run the bot

To run the bot:

```console
npm run run
```

To restart it every time something changes in the code:

```console
npm run dev
```

### Force Reload / Commands

This is only necessary if a new command is added or the description of one is changed.\
To reload the `/` commands, set the variable `forceReloadCommands` to `true`.

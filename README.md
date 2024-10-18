# Adira Interface

This is the Discord bot for our chatbot project.

## Setup

Install necessary dependencies:

```console
npm i
```

Add a `config/development.yaml` file with the bot token and client id (retrieved from the [Discord Developer Portal](https://discord.com/developers/applications/1285909172403310653)):

```yaml
app:
  bot:
    discordToken: xxxxx
    discordClientId: xxxxx
    forceReloadCommands: false
```

## Development

To run the bot:

```console
npm run run
```

To restart it everytime something changes in the code:

```console
npm run dev
```

### Force Reload / Commands

This is only necessary if a new command is added or the desription of one is changed.\
To reload the `/` commands, set the variable `forceReloadCommands` to `true`.

## Production

To compile for production:

```console
npm run build
```

import config from "config";

export interface Config {
  bot: {
    discordToken: string;
    discordClientId: string;
    forceReloadCommands: boolean;
  };
}

const appConfig: Config = config.get<Config>("app");

export default appConfig;

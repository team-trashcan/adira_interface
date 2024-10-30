import config from "config";

export interface Config {
  bot: {
    discordToken: string;
    discordClientId: string;
    forceReloadCommands: boolean;
    closedSupportTicketCategory: string;
    openSupportTicketCategory: string;
  };
  redis: {
    defaultTTL: number;
    options: {
      url: string;
    };
  };
  axios: {
    baseUrl: string;
    accessToken: string;
  };
  messages: {
    error500: string;
    noSupporterRoleSetup: string;
    errorNotInGuild: string;
  };
}

const appConfig: Config = config.get<Config>("app");

export default appConfig;

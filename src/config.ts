import config from "config";
import { LogLevel } from "./logger";

export interface Config {
  debug: {
    debugEnabled: boolean;
    logLevel: LogLevel;
  };
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

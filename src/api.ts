import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import appConfig from "./config";
import Logger, { LogLevel } from "./logger";

export class ApiError extends Error {}

class Api {
  private debugEnabled: boolean;

  private axios: Axios;
  private accessToken: string;

  private logger: Logger;
  public constructor(
    baseUrl: string,
    accessToken: string,
    debugEnabled: boolean,
    logLevel: LogLevel
  ) {
    this.debugEnabled = debugEnabled;

    this.axios = axios;
    this.accessToken = accessToken;

    this.axios.defaults.baseURL = baseUrl;

    this.logger = new Logger(logLevel);

    if (this.accessToken !== "" && this.accessToken !== null) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${this.accessToken}`;
    } else {
      // Authorization is a COULD have
      // throw new Error("No accessToken set!");
    }

    axios.interceptors.response.use(
      (res) => res,
      async (error: Error) => {
        if (error instanceof AxiosError) {
          throw new ApiError(
            `ApiError: ${error.status}: ${error.response?.statusText}`
          );
        }
      }
    );
  }

  public async getSupporterRole(guildId: string) {
    if (this.debugEnabled) {
      return {
        data: { roleId: "someId" },
      };
    }
    this.logger.debug(`GET /supporter_role/${guildId}`);
    return await this.axios.get(`/supporter_role/${guildId}`);
  }

  // Tell backend that a ticket has been created
  public async addTicketChannel(
    channelId: string,
    username: string
  ): Promise<AxiosResponse<{ success: boolean }, any>> {
    if (this.debugEnabled) {
      return {
        data: { success: true },
      } as unknown as AxiosResponse;
    }
    this.logger.debug("POST /sessions:", {
      userId: username,
      sessionId: channelId,
    });
    return await this.axios.post("/sessions", {
      userId: username,
      sessionId: channelId,
    });
  }

  public async getTicketChannels(): Promise<
    AxiosResponse<{ channelId: string; username: string }[], any>
  > {
    if (this.debugEnabled) {
      return {
        data: [
          {
            channelId: "1290916672085033030",
            username: "wurstkatze",
          },
        ],
      } as unknown as AxiosResponse;
    }
    this.logger.debug("GET /sessions");
    return await this.axios.get("/sessions");
  }

  public async setSupporterRole(
    guildId: string,
    supporterRoleId: string
  ): Promise<
    AxiosResponse<{ guildId: string; supporterRoleId: string }[], any>
  > {
    if (this.debugEnabled) {
      return {
        data: [
          {
            serverId: "1285912427208245360",
            roleId: "754777029630623795",
          },
        ],
      } as unknown as AxiosResponse;
    }
    this.logger.debug("POST /supporter_role:", {
      serverId: guildId,
      roleId: supporterRoleId,
    });
    return await this.axios.post(`/supporter_role`, {
      serverId: guildId,
      roleId: supporterRoleId,
    });
  }

  public async sendUserMessage(
    channelId: string,
    message: string,
    isSystemMessage?: boolean
  ): Promise<AxiosResponse<{ aiResponse: string }, any>> {
    if (this.debugEnabled) {
      return {
        data: { aiResponse: "Imagine a response from ChatGPT here..." },
      } as unknown as AxiosResponse;
    }
    this.logger.debug("POST /message:", {
      sessionId: channelId,
      message,
      isSystemMessage,
    });
    return await this.axios.post("/message", {
      sessionId: channelId,
      message,
      isSystemMessage,
    });
  }
}

const logLevel = process.env.DISCORD_BOT_LOG_LEVEL;
const api = new Api(
  appConfig.axios.baseUrl,
  appConfig.axios.accessToken,
  appConfig.debug.debugEnabled,
  (logLevel !== undefined && Object.values(LogLevel).includes(logLevel as LogLevel))
    ? logLevel as LogLevel
    : appConfig.debug.logLevel
);

export default api;

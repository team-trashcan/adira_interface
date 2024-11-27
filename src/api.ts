import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import appConfig from "./config";

export class ApiError extends Error {}

class Api {
  private debugEnabled: boolean;

  private axios: Axios;
  private accessToken: string;

  public constructor(
    baseUrl: string,
    accessToken: string,
    debugEnabled: boolean
  ) {
    this.debugEnabled = debugEnabled;

    this.axios = axios;
    this.accessToken = accessToken;

    this.axios.defaults.baseURL = baseUrl;

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
    return await this.axios.post(`/sessions`, {
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
    return await this.axios.get(`/sessions`);
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
            guildId: "1285912427208245360",
            supporterRoleId: "754777029630623795",
          },
        ],
      } as unknown as AxiosResponse;
    }
    return await this.axios.post(`/supporter_role/${guildId}`, {
      roleId: supporterRoleId,
    });
  }

  public async sendUserMessage(
    guildId: string,
    message: string,
    isSystemMessage?: boolean
  ): Promise<AxiosResponse<{ aiResponse: string }, any>> {
    if (this.debugEnabled) {
      return {
        data: { aiResponse: "Imagine a response from ChatGPT here..." },
      } as unknown as AxiosResponse;
    }
    return await this.axios.post(`/message`, {
      sessionId: guildId,
      message,
      isSystemMessage,
    });
  }
}

const api = new Api(
  appConfig.axios.baseUrl,
  appConfig.axios.accessToken,
  appConfig.debug.debugEnabled
);

export default api;

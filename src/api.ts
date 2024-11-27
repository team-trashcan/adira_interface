import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import appConfig from "./config";

export class ApiError extends Error {}

class Api {
  private axios: Axios;
  private accessToken: string;

  public constructor(baseUrl: string, accessToken: string) {
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
          throw new ApiError(JSON.stringify(error));
        }
      }
    );
  }

  public async getSupporterRole(guildId: string) {
    // return await this.axios.get(`/supporter_role/${guildId}`);
    return {
      data: { roleId: "someId" },
    };
  }

  // Tell backend that a ticket has been created
  public async addTicketChannel(
    channelId: string,
    username: string
  ): Promise<AxiosResponse<{ success: boolean }, any>> {
    // return await this.axios.post(`/sessions`, {
    //   userId: username,
    //   sessionId: channelId,
    // });
    // debug
    return {
      data: { success: true },
    } as unknown as AxiosResponse;
  }

  public async getTicketChannels(): Promise<
    AxiosResponse<{ channelId: string; username: string }[], any>
  > {
    // return await this.axios.get(`/sessions`);
    // debug
    return {
      data: [
        {
          channelId: "1290916672085033030",
          username: "wurstkatze",
        },
      ],
    } as unknown as AxiosResponse;
  }

  public async setSupporterRole(
    guildId: string,
    supporterRoleId: string
  ): Promise<
    AxiosResponse<{ guildId: string; supporterRoleId: string }[], any>
  > {
    // return await this.axios.post(`/supporter_role/${guildId}`, {
    //   roleId: supporterRoleId,
    // });
    // debug
    return {
      data: [
        {
          guildId: "1285912427208245360",
          supporterRoleId: "754777029630623795",
        },
      ],
    } as unknown as AxiosResponse;
  }

  public async sendUserMessage(
    guildId: string,
    message: string,
    isSystemMessage?: boolean
  ): Promise<AxiosResponse<{ aiResponse: string }, any>> {
    // return await this.axios.post(`/message`, {
    //   sessionId: guildId,
    //   message,
    //   isSystemMessage,
    // });
    // debug
    return {
      data: { aiResponse: "Imagine a response from ChatGPT here..." },
    } as unknown as AxiosResponse;
  }
}

const api = new Api(appConfig.axios.baseUrl, appConfig.axios.accessToken);

export default api;

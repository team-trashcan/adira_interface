import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import appConfig from "./config";

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
      async (e: Error) => {
        if (e instanceof AxiosError) {
          throw new Error(JSON.stringify(e.response?.data));
        }
      }
    );
  }

  // Get supporter roles
  public async getSupporterRoles(): Promise<
    AxiosResponse<{ guildId: string; supporterRoleId: string }[], any>
  > {
    // return await this.axios.get(`/supporter-roles`);
    return {
      data: [
        {
          guildId: "1285912427208245360",
          supporterRoleId: "1286049120813060166",
        },
      ],
    } as unknown as AxiosResponse;
  }

  // Tell backend that a ticket has been created
  // evtl. createTicket?
  public async addTicketChannel(
    channelId: string,
    username: string
  ): Promise<AxiosResponse<{ success: boolean }, any>> {
    // return await this.axios.post(`/issues`, { channelId, username });
    return {
      data: { success: true },
    } as unknown as AxiosResponse;
  }

  public async getTicketChannels(): Promise<
    AxiosResponse<{ channelId: string; username: string }[], any>
  > {
    // return await this.axios.get(`/issues`)
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
    // return await this.axios.post(`/supporter-roles`, {
    //   guildId,
    //   supporterRoleId,
    // });
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
    // some identifier
    message: string
  ): Promise<AxiosResponse<{ aiResponse: string }, any>> {
    // return await this.axios.post(`/user-message-oder-so`, {
    //   // some identifier
    //   message
    // });
    return {
      data: { aiMessage: "Imagine a response from ChatGPT here..." },
    } as unknown as AxiosResponse;
  }
}

const api = new Api(appConfig.axios.baseUrl, appConfig.axios.accessToken);

export default api;

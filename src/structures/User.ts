import { PartyClient } from "../PartyClient";
import { UserInvitesManager } from "../managers/UserInvitesManager";
import { type UserMeta } from "../types/Meta";
import { Party } from "./Party";

export interface UserOptions {
  id: string;
  meta?: UserMeta;
  client: PartyClient;
}

export class User {
  constructor({ id, meta, client }: UserOptions) {
    this.id = id;
    this.meta = meta;
    this.invites = new UserInvitesManager(client);
    this.client = client;
  }

  public id: string;
  public meta?: UserMeta;
  public invites: UserInvitesManager;
  public party: Party | null = null;
  public client: PartyClient;

  public get member() {
    return this.party?.members.get(this.id) ?? null;
  }

  public setMeta(meta: UserMeta) {
    this.meta = meta;
  }
}

import { PartyClient } from "../PartyClient";
import { Invite, type InviteOptions } from "../structures/Invite";
import { BaseManager } from "./BaseManager";

export class UserInvitesManager extends BaseManager<string, Invite> {
  constructor(client: PartyClient) {
    super(client);
  }

  public create(options: Omit<InviteOptions, "client">) {
    if (options.id && this.has(options.id)) throw new Error(`A party with id ${options.id} already exists`);

    const invite = new Invite({ ...options, client: this.client });
    this.set(invite.id, invite);
    return invite;
  }

  public delete(invite: Invite | string) {
    if (typeof invite !== "string") {
      if (invite._timeout) clearTimeout(invite._timeout);
      this.client.emit("inviteDelete", invite);
      invite = invite.id;
    } else {
      const inviteObj = this.get(invite);
      if (!inviteObj) return false;
      this.client.emit("inviteDelete", inviteObj);
      if (inviteObj._timeout) clearTimeout(inviteObj._timeout);
    }

    return super.delete(invite);
  }
}

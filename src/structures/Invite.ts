import { PartyClient } from "../PartyClient";
import { type InviteMeta } from "../types/Meta";
import { randomUUID } from "crypto";
import { PartyMember } from "./PartyMember";
import { User } from "./User";

export interface InviteOptions {
  id?: string;
  meta?: InviteMeta;
  invitee: User;
  inviter: PartyMember;
  expiresAt?: Date | null;
  client: PartyClient;
}

export class Invite {
  constructor({ id, meta, invitee, inviter, expiresAt, client }: InviteOptions) {
    this.id = id ?? randomUUID();
    this.meta = meta;
    this.invitee = invitee;
    this.inviter = inviter;
    this.expiresAt = expiresAt ?? null;
    this.client = client;

    this.client.emit("inviteCreate", this);

    if (this.expiresAt) {
      this._timeout = setTimeout(
        () => {
          this.invitee.invites.delete(this);
          this._timeout = null;
        },
        this.expiresAt?.getTime() - Date.now(),
      );
    }
  }

  public id: string;
  public meta?: InviteMeta;
  public invitee: User;
  public inviter: PartyMember;
  public accepted: boolean | null = null;
  public expiresAt: Date | null;
  public _timeout: NodeJS.Timeout | null = null;
  public client: PartyClient;

  public get expired() {
    return Date.now() >= (this.expiresAt?.getTime() ?? Infinity);
  }

  public get used() {
    return !this.invitee.invites.has(this.id);
  }

  public setMeta(meta: InviteMeta) {
    meta = meta;
  }

  public accept() {
    if (this.expired) throw new Error("Cannot accept an expired invite");
    if (this.used) throw new Error("Cannot accept a used invite");

    this.invitee.invites.delete(this);
    this.inviter.party.members.add(this.invitee);
    this.accepted = true;

    this.client.emit("inviteUse", this);
  }

  public deny() {
    if (this.expired) throw new Error("Cannot deny an expired invite");
    if (this.used) throw new Error("Cannot deny a used invite");

    this.invitee.invites.delete(this);
    this.accepted = false;

    this.client.emit("inviteUse", this);
  }
}

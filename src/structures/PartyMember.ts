import { PartyClient } from "../PartyClient";
import { Party } from "./Party";
import { User } from "./User";
import { type InviteMeta } from "../types/Meta";
import { MissingPermissionError } from "../errors/MissingPermissionError";

export interface PartyMemberOptions {
  user: User;
  party: Party;
  client: PartyClient;
}

export interface PartyMemberInviteOptions {
  id?: string;
  expiresAt?: Date;
  meta?: InviteMeta;
}

export class PartyMember {
  constructor({ user, party, client }: PartyMemberOptions) {
    this.id = user.id;
    this.user = user;
    this.party = party;
    this.client = client;
  }

  public id: string;
  public user: User;
  public party: Party;
  public client: PartyClient;

  public get leader() {
    return this.party.leader?.id === this.id;
  }

  public leave() {
    return this.party.members.delete(this);
  }

  public invite(user: User, options?: PartyMemberInviteOptions) {
    if (user.party?.id === this.party.id) throw new Error("User is already in this party");

    return user.invites.create({
      invitee: user,
      inviter: this,
      id: options?.id,
      expiresAt: options?.expiresAt,
      meta: options?.meta,
    });
  }

  public kick(member: PartyMember) {
    if (member.party.id !== this.party.id) throw new Error(`Party member with id ${member.id} is not in this party`);
    if (!this.leader) throw new MissingPermissionError("Party member is not the party leader");
    if (this.id === member.id) throw new Error("Party member cannot kick themselves");

    this.party.members.delete(member);
    this.client.emit("partyMemberKick", member, this);
  }

  public promote(member: PartyMember) {
    if (member.party.id !== this.party.id) throw new Error(`Party member with id ${member.id} is not in this party`);
    if (!this.leader) throw new MissingPermissionError("Party member is not the party leader");
    this.party.transferTo(member);
  }
}

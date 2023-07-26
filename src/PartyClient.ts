import { TypedEmitter } from "tiny-typed-emitter";
import { PartyManager } from "./managers/PartyManager";
import { UserManager } from "./managers/UserManager";
import { Party } from "./structures/Party";
import { PartyMember } from "./structures/PartyMember";
import { Invite } from "./structures/Invite";

export interface PartyClientEvents {
  partyCreate: (party: Party) => unknown;
  partyDelete: (party: Party) => unknown;
  partyMemberJoin: (member: PartyMember) => unknown;
  partyMemberLeave: (member: PartyMember) => unknown;
  partyMemberKick: (member: PartyMember, by: PartyMember) => unknown;
  partyMemberPromote: (member: PartyMember, by: PartyMember) => unknown;
  inviteCreate: (invite: Invite) => unknown;
  inviteUse: (invite: Invite) => unknown;
  inviteDelete: (invite: Invite) => unknown;
}

export interface PartyClientOptions {}

export class PartyClient extends TypedEmitter<PartyClientEvents> {
  constructor(options?: PartyClientOptions) {
    super();

    this.options = options ?? {};

    this.parties = new PartyManager(this);
    this.users = new UserManager(this);
  }

  public options: PartyClientOptions;
  public parties: PartyManager;
  public users: UserManager;
}

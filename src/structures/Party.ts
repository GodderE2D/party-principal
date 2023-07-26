import { PartyClient } from "../PartyClient";
import { type UserMeta, type PartyMeta } from "../types/Meta";
import { randomUUID } from "crypto";
import { PartyMember } from "./PartyMember";
import { PartyMemberManager } from "../managers/PartyMemberManager";
import { User } from "./User";

export interface PartyOptions {
  id?: string;
  meta?: PartyMeta;
  members: User[];
  leader?: User;
  client: PartyClient;
}

export class Party {
  constructor({ id, meta, members, leader, client }: PartyOptions) {
    if (!members?.length) throw new Error("A party cannot be created without any members");

    this.id = id ?? randomUUID();
    this.meta = meta;
    this.members = new PartyMemberManager(this, client);
    this.members.add(members);
    this.leader = this.members.get(leader?.id ?? members[0].id)!;
    this.client = client;

    client.emit("partyCreate", this);
  }

  public id: string;
  public meta?: PartyMeta;
  public members: PartyMemberManager;
  public leader: PartyMember;
  public client: PartyClient;

  public setMeta(meta: UserMeta) {
    meta = meta;
  }

  public transferTo(member: PartyMember) {
    if (member.party.id !== member.party.id) throw new Error(`Party member with id ${member.id} is not in this party`);
    if (member.leader) throw new Error(`Party member with id ${member.id} is already the party leader`);

    const oldLeader = this.leader;
    this.leader = member;
    this.client.emit("partyMemberPromote", member, oldLeader);
  }

  public delete() {
    this.client.parties.delete(this.id);
  }
}

import { PartyClient } from "../PartyClient";
import { Party } from "../structures/Party";
import { PartyMember } from "../structures/PartyMember";
import { type UserResolvable } from "../types/Resolvable";
import { BaseManager } from "./BaseManager";

export class PartyMemberManager extends BaseManager<string, PartyMember> {
  constructor(party: Party, client: PartyClient) {
    super(client);

    this.party = party;
  }

  public party: Party;

  public add(user: UserResolvable): PartyMember;
  public add(users: UserResolvable[]): PartyMember[];

  public add(userOrUsers: UserResolvable | UserResolvable[]) {
    if (userOrUsers instanceof Array) return userOrUsers.map((user) => this.add(user));

    if (typeof userOrUsers === "string") {
      const resolved = this.client.users.get(userOrUsers);
      if (!resolved) throw new Error(`User with id ${userOrUsers} not found`);
      userOrUsers = resolved;
    }

    if (this.has(userOrUsers.id)) throw new Error(`A party member with id ${userOrUsers.id} already exists`);

    const partyMember = new PartyMember({ user: userOrUsers, party: this.party, client: this.client });
    this.set(partyMember.id, partyMember);

    this.client.emit("partyMemberJoin", partyMember);

    return partyMember;
  }

  public set(key: string, member: PartyMember) {
    const user = this.client.users.get(member.id);
    if (user) {
      if (user.party) user.member?.leave();
      user.party = this.party;
    }

    return super.set(key, member);
  }

  public delete(member: PartyMember | string) {
    if (typeof member !== "string") {
      this.client.emit("partyMemberLeave", member);
      member = member.id;
    } else {
      const memberObj = this.get(member);
      if (!memberObj) return false;
      this.client.emit("partyMemberLeave", memberObj);
    }

    const user = this.client.users.get(member);
    if (user) user.party = null;

    return super.delete(member);
  }
}

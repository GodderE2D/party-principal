import { type PartyClient } from "../PartyClient";
import { Party, type PartyOptions } from "../structures/Party";
import { BaseManager } from "./BaseManager";

export class PartyManager extends BaseManager<string, Party> {
  constructor(client: PartyClient) {
    super(client);
  }

  public create(options: Omit<PartyOptions, "client">) {
    if (options?.id && this.has(options.id)) throw new Error(`A party with id ${options.id} already exists`);

    const party = new Party({ ...options, client: this.client });
    this.set(party.id, party);
    return party;
  }

  public delete(party: Party | string) {
    if (typeof party !== "string") {
      this.client.emit("partyDelete", party);
      party = party.id;
    } else {
      const partyObj = this.get(party);
      if (!partyObj) return false;
      this.client.emit("partyDelete", partyObj);
    }
    return super.delete(party);
  }
}

import { type PartyClient } from "../PartyClient";
import { Collection } from "@discordjs/collection";

export class BaseManager<K, V> extends Collection<K, V> {
  constructor(client: PartyClient) {
    super();
    this.client = client;
  }

  public client: PartyClient;
}

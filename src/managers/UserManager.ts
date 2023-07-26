import { PartyClient } from "../PartyClient";
import { User, type UserOptions } from "../structures/User";
import { BaseManager } from "./BaseManager";

export class UserManager extends BaseManager<string, User> {
  constructor(client: PartyClient) {
    super(client);
  }

  public register(options: Omit<UserOptions, "client">): User;
  public register(options: Omit<UserOptions, "client">[]): User[];

  public register(options: Omit<UserOptions, "client"> | Omit<UserOptions, "client">[]) {
    if (options instanceof Array) return options.map((user) => this.register(user));

    if (this.has(options.id)) throw new Error(`A user with id ${options.id} already exists`);

    const user = new User({ ...options, client: this.client });
    this.set(user.id, user);
    return user;
  }

  public delete(user: User | string) {
    if (typeof user !== "string") {
      user = user.id;
    }

    const userObj = this.get(user);
    if (!userObj) return false;
    userObj.member?.leave();

    return super.delete(user);
  }
}

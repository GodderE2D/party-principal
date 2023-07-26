# party-principal

Manage social/gaming party systems in JavaScript

## Install

Install the package using your favourite package manager.

```js
npm install party-principal
```

## Example

```js
const { PartyClient } = require("party-principal");

const client = new PartyClient();

// Register users
client.users.register([{ id: "flutter" }, { id: "twilight" }]);

// Create a party
const myParty = client.parties.create({
  id: "my-party",
  members: [client.users.get("flutter")],
});

// Handle party invites
const invite = myParty.members.get("flutter").invite(client.users.get("twilight"));
invite.accept();

// Create custom metadata for a user
myParty.members.get("flutter").setMeta({ level: 10 });
myParty.members.get("flutter").meta; // -> { level: 10 }

// Handle party leadership transfers
myParty.transferTo("twilight");
myParty.members.get("twilight").promote("flutter");

// Listen to party creations
client.on("partyCreate", (party) => {
  console.log(`Party ${party.id} created!`);
});
```

### Note on `PartyMember` methods

All methods on PartyMember are "secure", which means that party-principal will check their permissions before executing
them. For example, if you try to kick another member from the party while not being the party leader, party-principal
will throw an error.

```js
partyMember.leader; // -> false

// ❌ This will throw an error
partyMember.kick(otherMember);

// ✅ Bypass this by running it on the party instead
partyMember.party.members.delete(otherMember);
```

This way, you can directly run `.kick()` without checking if the user is a party leader.

### Accessing the client

You can access the client using `.client` on any class in party-principal (except for the client, of course).

### Setting custom meta types in TypeScript

```ts
declare namespace "party-principal" {
  type UserMeta: ...;
  type PartyMeta: ...;
  type InviteMeta: ...;
}
```

### Managers extends `@discordjs/collection`

Managers (`BaseManager`, `PartyManager`, `PartyMemberManager`, `UserInvitesManager`, and `UserManager`) extends
`@discordjs/collection` for storing data. See the
[documentation for Collections](https://discordjs.dev/docs/packages/collection/main/Collection:Class).

Some managers offer `.delete()` overrides which can take in the structure its managing instead of the key (the ID).

```js
const user = client.users.get("flutter");
client.users.delete("flutter");
```

It's not recommended to use set an existing value in a manager to undefined (`.set("id", undefined)`). Instead, use
`.delete()` to ensure proper side effects are executed.

## API

### PartyManager

Can be accessed through `PartyClient.parties`.

### PartyMemberManager

Can be accessed through `Party.members`.

#### `.add(userOrUsers: UserResolvable | UserResolvable[])`

```ts
type UserResolvable = User | string; // if a string is passed, it will be resolved to the user with that ID
```

Adds user(s) to the party.

### UserInvitesManager

Can be accessed through `User.invites`.

#### `.create(options: InviteOptions`

Creates an invite.

```ts
interface InviteOptions {
  id?: string;
  meta?: InviteMeta;
  invitee: User;
  inviter: PartyMember;
  expiresAt?: Date | null;
}
```

### UserManager

Can be accessed through `PartyClient.users`.

#### `.register(options: UserOptions | UserOptions[])`

Registers a global user.

```ts
interface UserOptions {
  id: string;
  meta?: UserMeta;
}
```

### Invite

Can be fetched through `User.invites.get()`.

#### `.id` (`string`)

The invite's ID.

#### `.meta` (`InviteMeta`)

The invite's metadata. Set metadata with `.setMeta()`.

#### `.invitee` (`User`)

The user who was invited.

#### `.inviter` (`PartyMember`)

The party member who invited the user.

#### `accepted` (`boolean | null`)

Whether the invite was accepted, denied, or is still pending.

#### `.expiresAt` (`Date | null`)

When the invite expires. If null, the invite will never expire.

#### `.expired` (`boolean`)

Whether the invite has expired.

#### `.used` (`boolean`)

Whether the invite has been used.

#### `.setMeta(meta: InviteMeta)` (`Invite`)

Sets the invite's metadata.

#### `.accept()`

Accepts the invite.

#### `.deny()`

Denies the invite.

### Party

Can be fetched through `Client.parties.get()`.

#### `.id` (`string`)

The party's ID.

#### `.meta` (`PartyMeta`)

The party's metadata. Set metadata with `.setMeta()`.

#### `.members` (`PartyMemberManager`)

The party's members.

#### `.leader` (`PartyMember`)

The party leader.

#### `.setMeta(meta: PartyMeta)` (`Party`)

Sets the party's metadata.

#### `.transferTo(member: PartyMember)` (`Party`)

Transfers party leadership to another member.

### PartyMember

Can be fetched through `Party.members.get()`.

#### `.id` (`string`)

The party member's ID.

#### `.user` (`User`)

The party member's global user object.

#### `.party` (`Party`)

The party the member is in.

#### `.leader` (`boolean`)

Whether the party member is the party leader.

#### `.leave()` (`boolean`)

Leaves the party. Returns whether the member was successfully removed from the party.

#### `.invite(user: User, options?: PartyMemberInviteOptions)` (`Invite`)

```ts
interface PartyMemberInviteOptions {
  id?: string;
  expiresAt?: Date;
  meta?: InviteMeta;
}
```

Invites a user to the party.

#### `.kick(member: PartyMember)` (`void`)

Kicks a member from the party. Throws a `MissingPermissionError` if the member is not the party leader.

#### `.promote(member: PartyMember)` (`void`)

Promotes a member to party leader. Throws a `MissingPermissionError` if the member is not the party leader.

### User

Can be fetched through `Client.users.get()`.

#### `.id` (`string`)

The user's ID.

#### `.meta` (`UserMeta`)

The user's metadata. Set metadata with `.setMeta()`.

#### `.invites` (`UserInvitesManager`)

The user's invites.

#### `.party` (`Party | null`)

The party the user is in. If null, the user is not in a party.

#### `.member` (`PartyMember | null`)

The party member object of the user. If null, the user is not in a party.

#### `.setMeta(meta: UserMeta)` (`User`)

Sets the user's metadata.

### Events

`PartyClient` exposes a Node.js `EventEmitter`. Listen to an event using `.on("eventName", (...params) => ...)`.

#### `.on("partyCreate")` (`party: Party`)`

Envoked when a party is created.

#### `.on("partyDelete")` (`party: Party`)`

Envoked when a party is deleted.

#### `.on("partyMemberJoin")` (`member: PartyMember`)`

Envoked when a party member joins a party.

#### `.on("partyMemberLeave")` (`member: PartyMember`)`

Envoked when a party member leaves a party.

#### `.on("partyMemberKick")` (`member: PartyMember, by: PartyMember`)`

Envoked whenever a party member is kicked from a party.

Please note that `member: PartyMember` will not be an actual member anymore and any methods on it should not be called.

#### `.on("partyMemberPromote")` (`member: PartyMember, by: PartyMember`)`

Envoked whenever a party member promotes another member.

Please note that `member: PartyMember` will not be an actual member anymore and any methods on it should not be called.

#### `.on("inviteCreate")` (`invite: Invite`)`

Envoked when an invite is created.

#### `.on("inviteUse")` (`invite: Invite`)`

Envoked when an invite is used.

#### `.on("inviteDelete")` (`invite: Invite`)`

Envoked when an invite is deleted, such as when it has been expired, used, or manually deleted.

### Types

#### `UserMeta` (`unknown`)

The type of metadata for a user. Can be configured by modifying the namespace.

#### `PartyMeta` (`unknown`)

The type of metadata for a party. Can be configured by modifying the namespace.

#### `InviteMeta` (`unknown`)

The type of metadata for an invite. Can be configured by modifying the namespace.

#### `UserResolvable` (`User | string`)

A user or a user ID.

### Errors

All errors extends the native `Error` class.

#### `MissingPermissionError`

Thrown when a method belonging to a User or PartyMember is called that requires a permission they do not have.

## License

Apache License 2.0

import { PartyClient } from ".";

const client = new PartyClient();

// Register users
const [flutterUser, _, dashUser] = client.users.register([{ id: "flutter" }, { id: "twilight" }, { id: "dash" }]);

// Create a party
const party = client.parties.create({ members: [flutterUser] });

// Add members to the party
const twilight = party.members.add("twilight");

// Check who's the party leader
console.log("The party leader is", party.leader.id);

// Transfer party leadership
party.transferTo(twilight);

// Kick a member from the party
const flutterMember = party.members.get("flutter");
if (!flutterMember) throw new Error("Flutter is not in the party");
twilight.kick(flutterMember);

// Invite a user to the party
const invite = twilight.invite(dashUser);

// Accept the invite
invite.accept();

// Check members in the party
console.log(party.members.map((m) => m.id));

// Disband the party
party.delete();

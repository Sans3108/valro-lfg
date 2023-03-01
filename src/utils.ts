import { QuickDB } from 'quick.db';
import { integerRating } from './commands/rate.js';

export interface UserRating {
  id: string;
  rating: integerRating;
  message: string;
}

export interface DB_User {
  rating: number;
  ratings: UserRating[];
}

export async function checkUser(db: QuickDB, id: string) {
  const users = db.table('users');

  if (!(await users.has(id))) {
    await users.set<DB_User>(id, {
      rating: 3,
      ratings: []
    });
  }
}

export function formatNumber(num: number): number {
  const numString = num.toString();
  const decimalIndex = numString.indexOf('.');

  if (decimalIndex !== -1) {
    return parseFloat(num.toFixed(1));
  } else {
    return num;
  }
}

export function calculateRating(userData: DB_User): number {
  return formatNumber(userData.ratings.reduce((acc, r) => acc + r.rating, 0) / userData.ratings.length);
}

export const Permissions = {
  // General Permissions
  Administrator: 8n,
  ViewAuditLog: 128n,
  ManageServer: 32n,
  ManageRoles: 268435456n,
  ManageChannels: 16n,
  KickMembers: 2n,
  BanMembers: 4n,
  CreateInstantInvite: 1n,
  ChangeNickname: 67108864n,
  ManageNicknames: 134217728n,
  ManageEmojisAndStickers: 1073741824n,
  ManageWebhooks: 536870912n,
  ViewChannels: 1024n,
  ManageEvents: 8589934592n,
  ModerateMembers: 1099511627776n,
  ViewServerInsights: 524288n,
  ViewCreatorMonetizationInsights: 2199023255552n,

  // Text Permissions
  SendMessages: 2048n,
  CreatePublicThreads: 34359738368n,
  CreatePrivateThreads: 68719476736n,
  SendMessagesInThreads: 274877906944n,
  SendTTSMessages: 4096n,
  ManageMessages: 8192n,
  ManageThreads: 17179869184n,
  EmbedLinks: 16384n,
  AttachFiles: 32768n,
  ReadMessageHistory: 65536n,
  MentionEveryone: 131072n,
  UseExternalEmojis: 262144n,
  UseExternalStickers: 137438953472n,
  AddReactions: 64n,
  UseSlashCommands: 2147483648n,

  // Voice Permissions
  Connect: 1048576n,
  Speak: 2097152n,
  Video: 512n,
  MuteMembers: 4194304n,
  DeafenMembers: 8388608n,
  MoveMembers: 16777216n,
  UseVoiceActivity: 33554432n,
  PrioritySpeaker: 256n,
  RequestToSpeak: 4294967296n,
  UseEmbeddedActivities: 549755813888n
} as const;

export function getPermissionsNames(bit: bigint): string[] {
  const permissionNames: string[] = [];

  for (const [name, value] of Object.entries(Permissions)) {
    if ((bit & value) === value) {
      permissionNames.push(name);
    }
  }

  return permissionNames;
}

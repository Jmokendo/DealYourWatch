import type { Session } from "next-auth";

export const DEV_USER = {
  id: "dev-user-1",
  email: "dev@test.com",
  name: "Dev User",
} as const;

export function createDevSession(userId: string = DEV_USER.id): Session {
  return {
    user: {
      id: userId,
      email: DEV_USER.email,
      name: DEV_USER.name,
      image: null,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

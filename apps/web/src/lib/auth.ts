import "server-only";

import { cookies } from "next/headers";
import { ApiError, getCurrentUser } from "./api";

export async function getCookieHeader() {
  return (await cookies()).toString();
}

export async function getOptionalSessionUser() {
  try {
    const response = await getCurrentUser(await getCookieHeader());
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

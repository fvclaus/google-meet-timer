import { UserInfo } from "@/types";
import {
  deleteSessionKey,
  getCredentials,
  getSession,
  setOrThrowSessionKey,
} from "@/app/session-store";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const userinfo: UserInfo = {
    authenticated: false,
    hasAcceptedPrivacyPolicy: false,
  };

  const sessionData = await getSession();

  if (sessionData === undefined) {
    return NextResponse.json(userinfo);
  }

  if (typeof sessionData.name === "string") {
    userinfo.name = sessionData.name;
  }
  if (typeof sessionData.picture === "string") {
    userinfo.picture = sessionData.picture;
  }
  userinfo.hasAcceptedPrivacyPolicy = sessionData.hasAcceptedPrivacyPolicy;

  const oauth2Client = await getCredentials();
  if (typeof oauth2Client !== "undefined") {
    try {
      // TODO How often do we need to actually load this endpoint to make sure that the user is still logged in.
      // If (userinfo.name === undefined || userinfo.picture === undefined) {
      const response = await google.oauth2("v2").userinfo.get({
        auth: oauth2Client,
      });

      if (response.data.name) {
        // TODO Expire
        // Expire()
        await setOrThrowSessionKey(req, "name", response.data.name);
        userinfo.name = response.data.name;
      }

      if (response.data.picture) {
        await setOrThrowSessionKey(req, "picture", response.data.picture);
        userinfo.picture = response.data.picture;
      }

      // }
      // TODO Missing refresh_token error handling
      userinfo.authenticated = true;
      // TODO Scope is only defined if we call the userinfo endpoint
      userinfo.scope = oauth2Client.credentials.scope;
    } catch (error) {
      const headers = new Headers();
      headers.set("Content-Type", "text/plain");
      if (
        error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
      ) {
        if (error.message === "invalid_grant" || error.status === 401) {
          // TODO Drop refresh token
          await deleteSessionKey(cookies(), "tokens");
          return new NextResponse("Tokens expired or revoked", {
            status: error.status,
            headers,
          });
        }

        console.log(error);
        return new NextResponse("Unknown error", {
          status: error.status,
          headers,
        });
      }
      // TODO Log this somehow
      console.log(error);

      return new NextResponse("Unknown error", { status: 500, headers });
    }
  }
  return NextResponse.json(userinfo);
}

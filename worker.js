import agoraToken from "agora-token";

const { RtcTokenBuilder2, RtcRole } = agoraToken;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      if (!env.AGORA_APP_ID || !env.AGORA_APP_CERTIFICATE) {
        throw new Error("Agora secrets are missing");
      }

      const url = new URL(request.url);

      const channel =
        url.searchParams.get("channel") || "dragontop";

      const uid =
        Number(url.searchParams.get("uid") || "0");

      if (!Number.isInteger(uid) || uid < 0) {
        throw new Error("Invalid uid");
      }

      const tokenExpirationInSeconds = 3600;
      const privilegeExpirationInSeconds = 3600;

      const token = RtcTokenBuilder2.buildTokenWithUid(
        env.AGORA_APP_ID,
        env.AGORA_APP_CERTIFICATE,
        channel,
        uid,
        RtcRole.PUBLISHER,
        tokenExpirationInSeconds,
        privilegeExpirationInSeconds
      );

      return new Response(
        JSON.stringify({
          appId: env.AGORA_APP_ID,
          token,
          channel,
          uid
        }),
        {
          status: 200,
          headers: corsHeaders
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error?.message || String(error)
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};
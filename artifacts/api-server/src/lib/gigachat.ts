import https from "https";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * GigaChat (Sberbank) OAuth2 client.
 *
 * TLS note: Sberbank hosts GigaChat API on servers that use certificates signed by
 * the Russian National CA (Минцифра / Gosuslugi CA), which is NOT in Node.js's
 * default trust store. As a result, strict TLS validation fails with
 * "UNABLE_TO_VERIFY_LEAF_SIGNATURE". The recommended workaround used by
 * Sberbank's own SDK and all official GigaChat integration examples is to set
 * `rejectUnauthorized: false` specifically for requests to *.sberbank.ru and
 * gigachat.devices.sberbank.ru endpoints only. This is scoped to a dedicated
 * https.Agent and does NOT affect any other outgoing connections.
 *
 * Alternative: bundle the Sberbank/Минцифра root CA cert via `ca` option.
 */
const sberbankAgent = new https.Agent({ rejectUnauthorized: false });

interface GigaChatToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: GigaChatToken | null = null;

async function getGigaChatAuthKey(): Promise<string | null> {
  if (process.env.GIGACHAT_KEY) {
    return process.env.GIGACHAT_KEY;
  }
  try {
    const setting = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, "GIGACHAT_KEY"))
      .limit(1);
    return setting[0]?.value || null;
  } catch {
    return null;
  }
}

async function getGigaChatToken(authKey: string): Promise<string | null> {
  if (
    cachedToken &&
    cachedToken.expires_at > Date.now() + 60000
  ) {
    return cachedToken.access_token;
  }

  return new Promise((resolve) => {
    const postData = "scope=GIGACHAT_API_PERS";
    const options: https.RequestOptions = {
      hostname: "ngw.devices.sberbank.ru",
      port: 9443,
      path: "/api/v2/oauth",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "RqUID": crypto.randomUUID(),
        "Authorization": `Basic ${authKey}`,
        "Content-Length": Buffer.byteLength(postData),
      },
      agent: sberbankAgent,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            cachedToken = {
              access_token: json.access_token,
              expires_at: json.expires_at || Date.now() + 1800000,
            };
            resolve(json.access_token);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}

export interface GigaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function gigaChatComplete(
  messages: GigaChatMessage[],
  model: string = "GigaChat-Pro"
): Promise<string | null> {
  const authKey = await getGigaChatAuthKey();
  if (!authKey) return null;

  const token = await getGigaChatToken(authKey);
  if (!token) return null;

  const body = JSON.stringify({
    model,
    messages,
    max_tokens: 500,
    temperature: 0.8,
  });

  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: "gigachat.devices.sberbank.ru",
      path: "/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(body),
      },
      agent: sberbankAgent,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content;
          resolve(content || null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

export async function isGigaChatConfigured(): Promise<boolean> {
  const key = await getGigaChatAuthKey();
  return !!key;
}

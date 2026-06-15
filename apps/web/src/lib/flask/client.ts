type FlaskErrorBody = {
  error?: string;
  errors?: string[];
  outcome?: string;
};

export type RegisterVoterFlaskResult =
  | { outcome: "created"; voter_id: string }
  | { outcome: "quarantined"; quarantine_id: string; match_type: string }
  | { outcome: "validation_error"; errors: string[] };

function flaskBaseUrl(): string {
  return process.env.FLASK_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";
}

export async function flaskRegisterVoter(
  campaignId: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<
  | { ok: true; data: RegisterVoterFlaskResult }
  | { ok: false; status: number; message: string }
> {
  const res = await fetch(
    `${flaskBaseUrl()}/api/campaigns/${campaignId}/voters/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const data = (await res.json().catch(() => ({}))) as RegisterVoterFlaskResult &
    FlaskErrorBody;

  if (!res.ok) {
    const message =
      data.errors?.join(" ") ??
      data.error ??
      `Error del servicio de registro (${res.status}).`;
    return { ok: false, status: res.status, message };
  }

  if (
    data.outcome !== "created" &&
    data.outcome !== "quarantined" &&
    data.outcome !== "validation_error"
  ) {
    return { ok: false, status: 502, message: "Respuesta inválida del API." };
  }

  return { ok: true, data };
}

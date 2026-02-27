type OperationalAgentAccessEmailInput = {
  agentName: string;
  loginEmail: string;
  loginPhone: string;
  temporaryPassword: string;
  institutionName?: string | null;
  teamName?: string | null;
};

export function buildOperationalAgentAccessEmail({
  agentName,
  loginEmail,
  loginPhone,
  temporaryPassword,
  institutionName,
  teamName,
}: OperationalAgentAccessEmailInput) {
  const subject = "Acesso inicial ao app de agentes - ShadBoard";

  const contextLines = [
    institutionName ? `Instituição: ${institutionName}` : null,
    teamName ? `Equipe: ${teamName}` : null,
  ].filter((line): line is string => Boolean(line));

  const text = [
    `Olá, ${agentName}.`,
    "Seu acesso inicial ao app de agentes do ShadBoard foi gerado.",
    "",
    "Credenciais provisórias:",
    `Login por e-mail: ${loginEmail}`,
    `Login por telefone: ${loginPhone}`,
    `Senha temporária: ${temporaryPassword}`,
    contextLines.length > 0 ? "" : null,
    ...contextLines,
    "",
    "No primeiro acesso, altere sua senha para manter sua conta segura.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Acesso inicial - ShadBoard</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #d7dfef;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 24px;background:linear-gradient(135deg,#0b1f47 0%,#17377d 100%);">
                  <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#c8d7ff;">ShadBoard</p>
                  <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;color:#ffffff;font-weight:700;">Credenciais de acesso do agente</h1>
                  <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#d8e4ff;">Olá, <strong>${agentName}</strong>. Seu acesso inicial foi criado com sucesso.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f5;border-radius:12px;background:#f8fbff;">
                    <tr>
                      <td style="padding:18px;">
                        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1d4ed8;letter-spacing:0.04em;text-transform:uppercase;">Credenciais provisórias</p>
                        <p style="margin:0 0 8px;font-size:15px;line-height:1.5;"><strong>Login por e-mail:</strong> ${loginEmail}</p>
                        <p style="margin:0 0 8px;font-size:15px;line-height:1.5;"><strong>Login por telefone:</strong> ${loginPhone}</p>
                        <p style="margin:0;font-size:15px;line-height:1.5;"><strong>Senha temporária:</strong> <span style="display:inline-block;background:#0b1f47;color:#ffffff;border-radius:8px;padding:4px 10px;font-weight:700;letter-spacing:0.04em;">${temporaryPassword}</span></p>
                      </td>
                    </tr>
                  </table>
                  ${
                    contextLines.length > 0
                      ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#334155;">${contextLines.join("<br />")}</p>`
                      : ""
                  }
                  <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#334155;">Por segurança, recomendamos alterar a senha no primeiro acesso ao aplicativo de agentes.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;background:#f8fbff;border-top:1px solid #e2e8f5;">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">E-mail automático do ShadBoard. Caso não reconheça este cadastro, entre em contato com a gestão da sua instituição.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  return {
    subject,
    text,
    html,
  };
}

const UUID_PATTERN =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

export function extractProtocolId(value: string) {
  const match = value.match(UUID_PATTERN);
  return match?.[1] ?? null;
}

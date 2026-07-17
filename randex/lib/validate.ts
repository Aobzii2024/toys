export function isValidQQ(qq: string): boolean {
  return /^[1-9][0-9]{4,11}$/.test(qq);
}

export function containsBlocked(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => w && lower.includes(w.toLowerCase()));
}

export function clampMessage(input: {
  name?: string;
  qq: string;
  body: string;
}) {
  return {
    name: (input.name ?? "").trim().slice(0, 32),
    qq: input.qq.trim().slice(0, 15),
    body: input.body.trim().slice(0, 500),
  };
}

export function stripDangerous(text: string): string {
  return text.replace(/[<>]/g, "");
}

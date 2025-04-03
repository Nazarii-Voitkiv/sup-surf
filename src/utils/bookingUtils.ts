export function generateConfirmationId(): string {
  return `order${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
}

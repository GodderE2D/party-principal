export class MissingPermissionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

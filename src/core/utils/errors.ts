export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class UmiTimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UmiTimeError";
  }
}

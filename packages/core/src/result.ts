export class Result<T, E = Error> {
  private constructor(
    public _tag: "Ok" | "Err",
    public value?: T,
    public error?: E,
  ) {}

  // Static method to create an Err instance
  static Err<E = Error>(error: E): Result<never, E> {
    return new Result<never, E>("Err", undefined, error);
  }

  // Static method to create an Ok instance
  static Ok<T>(value: T): Result<T, never> {
    return new Result<T, never>("Ok", value);
  }

  // Method to check if the result is Ok
  isOk(): this is Result<T, never> {
    return this._tag === "Ok";
  }

  // Method to check if the result is Err
  isErr(): this is Result<never, E> {
    return this._tag === "Err";
  }

  // Method to unwrap the value, throwing an error if the result is Err
  unwrap(): T {
    if (this.isOk()) {
      return this.value as T;
    }
    throw new Error(`Tried to unwrap an Err value: ${this.error}`);
  }

  // Method to unwrap the error, throwing an error if the result is Ok
  unwrapErr(): E {
    if (this.isErr()) {
      return this.error as E;
    }
    throw new Error(`Tried to unwrap an Ok value: ${this.value}`);
  }
}

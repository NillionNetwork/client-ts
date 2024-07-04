export class Token {
  static Unil = "unil";

  private constructor() {}

  public static asUnil(value: number): string {
    return `${value}${Token.Unil}`;
  }
}

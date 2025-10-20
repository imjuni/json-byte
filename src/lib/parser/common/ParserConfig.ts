/* eslint-disable no-underscore-dangle */
export class ParserConfig {
  private _guard = 1_000_000;

  public get guard(): number {
    return this._guard;
  }

  constructor(config: { guard: number }) {
    this._guard = config.guard;
  }
}

import { v4 } from "uuid";

export default class UUID {
  readonly value: string;

  constructor() {
    this.value = v4();
  }
}
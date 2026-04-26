export type JsonObject = {
  [key: string]: JsonValue
}

export type JsonValue = JsonObject | JsonValue[] | boolean | null | number | string

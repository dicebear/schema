import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = resolve(__dirname, "../../src");

export const LIMITS = {
  attributeString: 1024,
  pathDataString: 16384,
  colorValue: 1024,
  elementValue: 4096,
  dataUri: 262144,
};

export function loadSchema(filename) {
  const content = readFileSync(resolve(schemaDir, filename), "utf-8");
  return JSON.parse(content);
}

export function createValidator(schema) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  return ajv.compile(schema);
}

export function withCanvas(extra) {
  return { canvas: { elements: [], width: 100, height: 100 }, ...extra };
}

export function getDefSchema(schema, defName) {
  const def = schema.definitions?.[defName];
  if (!def) {
    throw new Error(`definition "${defName}" not found in schema`);
  }

  return {
    $schema: schema.$schema,
    definitions: schema.definitions,
    ...def,
  };
}

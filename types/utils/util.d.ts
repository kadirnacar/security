export function isValidCallback(callback: any): boolean;
export function execCallback(callback: any, arg1: any, arg2: any): void;
export function createUuidV4(): string;
export function getTypeOfValue(value: any): "object" | "unknown" | "function" | "undefined" | "null" | "array" | "boolean" | "string" | "integer" | "float";
export function isInvalidValue(value: any, type: any, allowEmpty: any): string;
export function isXml(xml: any): boolean;

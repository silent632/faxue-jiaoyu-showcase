#!/usr/bin/env node
import { validateContent } from "../lib/content/validate-content.js";

const result = validateContent();

if (!result.ok) {
  console.error("Content validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");

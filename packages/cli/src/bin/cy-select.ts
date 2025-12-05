#!/usr/bin/env node

/**
 * Binary entry point for cy-select command
 * This file is the actual executable that gets called when users run 'cy-select'
 */

import { main } from "../index.js";

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});


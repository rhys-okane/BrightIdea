import type {D1Database} from "@cloudflare/workers-types";
import {drizzle} from "drizzle-orm/d1";
import {env} from "hono/adapter";
import {Resource} from "sst";

export const db = (binding: D1Database) => drizzle(binding);

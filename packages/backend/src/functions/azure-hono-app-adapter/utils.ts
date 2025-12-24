import type {Cookie} from "@azure/functions";

export const streamToAsyncIterator = (readable: Response["body"]) => {
	if (readable == null) return null;
	const reader = readable.getReader();
	return {
		next() {
			return reader.read();
		},
		return() {
			return reader.releaseLock();
		},
		[Symbol.asyncIterator]() {
			return this;
		},
	} as AsyncIterableIterator<Uint8Array>;
};

type LoopableHeader = {
	forEach: (callbackfn: (value: string, key: string) => void) => void;
};

export function headersToObject(input: LoopableHeader): Record<string, string> {
	const headers: Record<string, string> = {};
	input.forEach((v, k) => (headers[k] = v));
	return headers;
}

export function cookiesFromHeaders(headers: Headers): Cookie[] | undefined {
	const cookies = headers.getSetCookie();
	if (cookies.length === 0) return undefined;

	return cookies.map(parseCookieString);
}
type SameSite = "Strict" | "Lax" | "None";

function isSameSite(value: string): value is SameSite {
	return value === "Strict" || value === "Lax" || value === "None";
}

function parseBooleanAttribute(value: string | undefined): boolean {
	return value === "true" || value === undefined;
}

function parseMaxAge(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const parsed = parseInt(value, 10);
	return isNaN(parsed) ? undefined : parsed;
}

function parseExpires(value: string | undefined): Date | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	return isNaN(date.getTime()) ? undefined : date;
}

function parseSameSite(value: string | undefined): SameSite | undefined {
	if (!value) return undefined;
	// Normalize case for comparison
	const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
	return isSameSite(normalized) ? normalized : undefined;
}

export function parseCookieString(cookieString: string): Cookie {
	const parts = cookieString.split(";").map(x => x.trim());
	const [first, ...rest] = parts;

	if (!first) {
		throw new Error("Invalid cookie string: missing name-value pair");
	}

	const [name, encodedValue] = first.split("=").map(x => x.trim());

	if (!name || encodedValue === undefined) {
		throw new Error("Invalid cookie string: malformed name-value pair");
	}

	const attrs = new Map<string, string | undefined>();
	for (const attr of rest) {
		const [key, value] = attr.split("=");
		if (key) {
			attrs.set(key.toLowerCase().trim(), value?.trim());
		}
	}

	return {
		name,
		value: decodeURIComponent(encodedValue),
		path: attrs.get("path"),
		sameSite: parseSameSite(attrs.get("samesite")),
		secure: parseBooleanAttribute(attrs.get("secure")),
		httpOnly: parseBooleanAttribute(attrs.get("httponly")),
		domain: attrs.get("domain"),
		expires: parseExpires(attrs.get("expires")),
		maxAge: parseMaxAge(attrs.get("max-age")),
	};
}

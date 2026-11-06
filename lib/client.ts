// Browser-side helper for calling the API routes with the visitor's key.

export const KEY_STORAGE = "openai-key";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** POST JSON (or a FormData of PDFs) and return the parsed reply, or throw its `{ error }`. */
export async function post<T>(path: string, body: object | FormData, key: string): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(path, {
    method: "POST",
    headers: { "x-openai-key": key, ...(isForm ? {} : { "content-type": "application/json" }) },
    body: isForm ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: `The server replied with ${res.status}.` }));
  if (!res.ok || data.error) throw new ApiError(data.error ?? "Something went wrong.", res.status);
  return data as T;
}

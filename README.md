# HR policy assistant

Ask a question about leave, travel or benefits and get a short answer that cites the
**policy section** and the **page** it came from. Upload your own HR handbook PDFs, or try one
of the three built-in sample handbooks.

The point of the project is to practise **chunking and vector search by hand**: there is no
vector database and no RAG library. The screen is built around the handbook's pages so you
can watch each step of the search happen.

## How it works

| Step | Route | What happens |
| --- | --- | --- |
| 1. Read | `POST /api/read` | `unpdf` turns each PDF page into plain text (samples are already split into pages). |
| 1. Chunk | `POST /api/chunk` | Each page is cut into ~120-word chunks; each starts 30 words before the last one ended. A chunk never crosses a page, so it always knows its page number. |
| 2. Embed | `POST /api/embed` | Every chunk goes to OpenAI `text-embedding-3-small` at 768 dimensions. Chunks + vectors are the whole index. It's sent back to the browser and kept there, so a follow-up question doesn't embed the handbook again. |
| 3. Search | `POST /api/search` | The question is embedded the same way, every chunk is scored with a hand-written cosine similarity, and the top 4 are kept. |
| 4. Answer | `POST /api/answer` | Only those 4 chunks, numbered, go to the model through the Responses API (low reasoning effort). It returns JSON: the answer, whether the handbook covers it, the section it cites, and which chunks it used. Partly covered questions get a partial answer instead of a refusal. |

The page calls the routes in order. While it runs, the page tiles pulse while being read,
get one stripe per chunk, turn green by how close their best chunk is to the question, show
`#1`–`#4` badges for the chunks sent to the model, and a tick on the pages it used.

## Your OpenAI key

The app runs on the visitor's own OpenAI key. Paste it in the bar at the top: it is kept in
`sessionStorage` (`openai-key`) for that tab only and sent as an `x-openai-key` header on each
request. The routes use that header first and fall back to `OPENAI_API_KEY` from `.env.local`.
The key is never logged or stored on the server.

Models: `gpt-5-mini` by default, or `gpt-6.1-sol` (cheaper) from the switch at the top right.

## Limits

To stop one click burning through a quota: at most **3 PDFs**, **4 MB** in total, **40 pages**
and **150 chunks**. Questions are capped at 500 characters. Scanned PDFs (images of pages)
have no text and can't be read.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000, paste your key, and press **Ask**: the first sample question is
already filled in. Optionally, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`
to skip pasting a key.

## Code map

```
app/page.tsx            state, the run loop and the layout
app/api/*/route.ts      one route per step: read, chunk, embed, search, answer
components/             one file per part of the screen (LiveBar, AskBar, PageWall, PageTile,
                        StepStrip, AnswerCard, LiftedPage, ChunkList, ModelSwitch)
lib/agent.ts            every OpenAI call (embeddings + Responses API)
lib/chunk.ts            the chunker
lib/cosine.ts           cosine similarity and ranking
lib/pdf.ts              PDF -> page text with unpdf
lib/samples.ts          three sample handbooks (leave, travel & expenses, benefits)
lib/limits.ts           caps and chunk sizes
lib/server.ts           key lookup and `{ error }` responses for the routes
lib/validate.ts         input checks for the routes
lib/client.ts           browser helper that calls the routes with the key
```

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 via the
`@tailwindcss/turbopack` loader, the `openai` package, `unpdf` 1.x and `lucide-react`.
The sample handbooks and the company in them are fictional.

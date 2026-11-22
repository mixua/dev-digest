# LLM providers and cost

## The seam

The engine only knows the `LLMProvider` interface (`server/src/vendor/shared/adapters.ts:82`): `id` (`openai|anthropic|openrouter`), `listModels`, `complete`, `completeStructured<T>`, `embed`. `reviewPullRequest` calls **only** `completeStructured`, which returns `{data, model, tokensIn, tokensOut, costUsd: number | null, raw, attempts}`. The provider is injected via `ReviewInput.llm`, which keeps the engine I/O-free.

## Who implements it

| Provider | Where | Notes |
|---|---|---|
| `openrouter` | `reviewer-core/src/llm/openrouter.ts` (`OpenRouterProvider`) | The **only** provider inside this package. OpenAI SDK pointed at `https://openrouter.ai/api/v1`; usable for the CI runner and the server. `id` may also be `'openai'` (OpenAI-compatible base URL option). Only `completeStructured` and `listModels` are implemented; `complete`/`embed` throw |
| `openai`, `anthropic` | `server/src/adapters/llm/{openai,anthropic}.ts` | Live in the **server**, not here; always cost via `estimateCost` |
| mocks | `server/src/adapters/mocks.ts`, test stubs | `MockLLMProvider` etc. |

The server picks the provider per agent (`container.llm(agent.provider)`, `server/src/platform/container.ts`).

## `OpenRouterProvider.completeStructured`

- Request: `response_format: json_schema` (strict) from the Zod schema, `temperature` default 0, SDK timeout 90 s and 2 SDK retries (`opts.timeoutMs`, `opts.maxRetries`).
- OpenRouter-only extras: `session_id` (groups all chunks of one review) and `usage: { include: true }` to get real cost back.
- HTTP 200 without `choices` is turned into an error (upstream/moderation/limit).
- Loop of up to `maxRetries + 1` attempts: on schema failure the assistant output and a repair prompt are appended and it asks again; tokens and cost accumulate across attempts. Exhausted -> throws `structured output failed schema validation`.

## Cost accounting

```
costUsd = usage.cost (OpenRouter, summed over attempts)
          ?? estimateCost(model, tokensIn, tokensOut)   // injected option
          ?? null
```

(`openrouter.ts:97-107`.)

- `usage.cost` is the real generation cost in USD; used whenever any attempt returned a numeric one.
- `estimateCost` is **injected** (`OpenRouterProviderOptions.estimateCost`) so the engine carries no price table. The server injects `container.priceBook.estimate`: live OpenRouter `/models` prices (cached 6 h, refreshed lazily and non-blocking) falling back to the static table `server/src/adapters/llm/pricing.ts` (`estimateCost`, USD per 1M tokens; unknown model -> `null`). The CI runner passes none, so there the fallback ends at `null`.
- Across chunks, `reviewPullRequest` sums costs but any chunk with `costUsd == null` makes the whole `ReviewOutcome.costUsd` `null` (`run.ts:333`) — "unknown" never silently under-reports.
- Today the server does **not** persist `costUsd` (run-executor stores tokens only); it is available on the outcome for callers that want it.

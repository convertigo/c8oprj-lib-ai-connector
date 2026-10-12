Shared library that serves the modern chat completion APIs of all major AI providers.

## Recommended entry point: AIChat

`AIChat` is the hat (facade) sequence: it routes a chat completion request to the right provider sequence based on the `provider` variable.

| Variable | Description |
|---|---|
| `provider` | `openai` \| `anthropic` \| `gemini` \| `mistral` (default `openai`) |
| `prompt` | User prompt sent to the model (required) |
| `model` | Model id understood by the provider. Empty = target sequence default |
| `system` | Optional system prompt (role / instructions) |
| `temperature` | Optional sampling temperature (0-2, provider dependent) |
| `max_tokens` | Optional maximum number of tokens in the response |
| `api_key` | Provider API key. Empty = the provider's lib_AIConnector symbol |
| `base_url` | `openai` provider only: base URL of any OpenAI-compatible endpoint |

Dispatch:

- `openai` -> `ChatCompletion`
- `anthropic` -> `AnthropicMessage`
- `gemini` -> `GeminiMessage`
- `mistral` -> `MistralMessage`

The sub-sequence response is copied into the AIChat output; the answer shape follows the target provider.

Example: `AIChat?provider=anthropic&model=claude-sonnet-4-5&prompt=Hello`.

## Provider sequences

- `ChatCompletion` - OpenAI-compatible chat completions. Default model `gpt-4o-mini`. Variables: prompt, model, system, temperature, max_tokens, base_url, api_key. `base_url` overrides the endpoint (any OpenAI-compatible API).
- `AnthropicMessage` - Anthropic native Messages API. Default model `claude-sonnet-4-5`. Variables: prompt, model, system, temperature, max_tokens, api_key.
- `GeminiMessage` - Google Gemini through its OpenAI-compatible endpoint (`/v1beta/openai/chat/completions`). Default model `gemini-2.5-flash`. Variables: prompt, model, system, temperature, max_tokens, api_key.
- `MistralMessage` - Mistral AI chat completions (`api.mistral.ai/v1/chat/completions`). Default model `mistral-large-latest`. Variables: prompt, model, system, temperature, max_tokens, api_key.

Each sequence copies the provider response into its output via an XMLCopyStep.

## Symbols

API keys are never stored in the project. Each provider reads its key from a symbol at runtime; pass `api_key` to override (for example for tests):

| Symbol | Provider |
|---|---|
| `lib_AIConnector.openai_apikey.secret` | OpenAI (`ChatCompletion`) |
| `lib_AIConnector.anthropic_apikey.secret` | Anthropic (`AnthropicMessage`) |
| `lib_AIConnector.gemini_apikey.secret` | Google Gemini (`GeminiMessage`) |
| `lib_AIConnector.mistral_apikey.secret` | Mistral (`MistralMessage`) |

Set their values in the administration console.
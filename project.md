
# ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/core/images/project_color_16x16.png?raw=true "Project") lib_AIConnector

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

<details><summary><span style="color:DarkGoldenRod"><i>References</i></span></summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/references/images/ProjectSchemaReference_16x16.png?raw=true "ProjectSchemaReference") lib_AIConnector


see [readme](/Users/opic/runtime-New84/lib_AIConnector//tree/master#readme)
</p></blockquote></details>

<details><summary><span style="color:DarkGoldenRod"><i>Connectors</i></span></summary><blockquote><p>


<details><summary><b>AI</b></summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") AI



<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


<details><summary><b>ChatCompletions</b> : POST to any OpenAI-compatible /v1/chat/completions endpoint</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") ChatCompletions

POST to any OpenAI-compatible /v1/chat/completions endpoint. The sequence passes the full URL through __uri (prepare step), so the connector origin (api.openai.com) is only the default.

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__body
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>
Bearer API key, passed by the ChatCompletion sequence (JS scope)
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>Default_transaction</b></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/httptransaction_color_16x16.png?raw=true "HttpTransaction") Default_transaction


</p></blockquote></details>
</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>Anthropic</b> : Anthropic native API (api</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") Anthropic

Anthropic native API (api.anthropic.com): Messages endpoint.

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") Messages

POST /v1/messages: Anthropic native Messages API. The sequence passes model, max_tokens, system and messages through __body, and the x-api-key / anthropic-version headers.

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__body
</td>
<td>
JSON request body (model, max_tokens, system, messages), passed by the AnthropicMessage sequence (JS scope)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_anthropic_version
</td>
<td>
anthropic-version header (2023-06-01), from the AnthropicMessage sequence (JS scope)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_api_key
</td>
<td>
Anthropic API key (x-api-key header), from the AnthropicMessage sequence (JS scope)
</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>c8oforms_response_fs</b> : Fullsync connector that holds all responses</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/fullsyncconnector_color_16x16.png?raw=true "FullSyncConnector") c8oforms_response_fs

Fullsync connector that holds all responses

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/couchdb/images/getdocumentattachment_color_16x16.png?raw=true "GetDocumentAttachmentTransaction") GetDocumentAttachment



<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;_use_attname
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;_use_attpath
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;_use_docid
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>Gemini</b> : Google Gemini API (generativelanguage</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") Gemini

Google Gemini API (generativelanguage.googleapis.com) through the official OpenAI-compatible endpoint /v1beta/openai/chat/completions. The native generateContent path contains a colon that the Convertigo HTTP client cannot send reliably, so the OpenAI-compatible endpoint is used instead.

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") GenerateContent

POST /v1beta/openai/chat/completions (Gemini OpenAI-compatible endpoint). The sequence passes the model, messages and Bearer key through __body and __header_Authorization.

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__body
</td>
<td>
JSON request body (contents, systemInstruction...), passed by the GeminiMessage sequence (JS scope)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>
Bearer Gemini API key, passed by the GeminiMessage sequence (JS scope)
</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>Mistral</b> : Mistral AI API (api</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") Mistral

Mistral AI API (api.mistral.ai), OpenAI-compatible /v1/chat/completions endpoint.

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") ChatCompletions

POST /v1/chat/completions (Mistral OpenAI-compatible endpoint). The sequence passes the model and messages through __body and the Bearer key through __header_Authorization.

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__body
</td>
<td>
JSON request body (model, messages), passed by the MistralMessage sequence (JS scope)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>
Bearer Mistral API key, passed by the MistralMessage sequence (JS scope)
</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>void</b> : void connector, replace or don't use it</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/sqlconnector_color_16x16.png?raw=true "SqlConnector") void

void connector, replace or don't use it

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/sqltransaction_color_16x16.png?raw=true "SqlTransaction") void

does nothing
</p></blockquote></details>
</p></blockquote></details>
</p></blockquote></details>

<details><summary><span style="color:DarkGoldenRod"><i>Sequences</i></span></summary><blockquote><p>


<details><summary><b>AIChat</b> : Hat (facade) sequence: routes a chat completion request to the right provider connector</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") AIChat

Hat (facade) sequence: routes a chat completion request to the right provider connector.

Variables: provider (openai | anthropic | gemini | mistral, default openai), prompt (required), model, system, temperature, max_tokens, api_key (empty = the provider's lib_AIConnector symbol), base_url (openai provider only: any OpenAI-compatible endpoint).

Dispatch: openai -> ChatCompletion, anthropic -> AnthropicMessage, gemini -> GeminiMessage, mistral -> MistralMessage. The answer shape follows the target provider.

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;api_key
</td>
<td>
Provider API key. Empty = the provider's lib_AIConnector symbol.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;base_url
</td>
<td>
openai provider only: base URL of any OpenAI-compatible endpoint. Empty = OpenAI.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Optional maximum number of tokens in the response.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
Model id understood by the provider. Empty = the target sequence default (gpt-4o-mini, claude-sonnet-4-5, gemini-2.5-flash, mistral-large-latest).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;prompt
</td>
<td>
User prompt sent to the model (required).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;provider
</td>
<td>
Target provider: openai | anthropic | gemini | mistral. Default openai.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;system
</td>
<td>
Optional system prompt (role / instructions).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;temperature
</td>
<td>
Optional sampling temperature (0-2, provider dependent).
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>AnthropicMessage</b> : Chat completion through the Anthropic native Messages API (Claude models)</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") AnthropicMessage

Chat completion through the Anthropic native Messages API (Claude models).

Variables: prompt (required), model (default claude-sonnet-4-5), system, temperature, max_tokens (default 1024), api_key (empty = lib_AIConnector.anthropic_apikey.secret symbol).

Returns the provider response document (content[0].text holds the answer).

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;api_key
</td>
<td>
Anthropic API key. Empty = the default key from the lib_AIConnector.anthropic_apikey.secret symbol (administration console).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Maximum tokens in the response (required by the Anthropic API, default 1024)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
Claude model id (claude-sonnet-4-5, claude-opus-4-5, claude-haiku-4-5...)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;prompt
</td>
<td>
The user prompt sent to the model (required)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;system
</td>
<td>
Optional system prompt (role / instructions)
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;temperature
</td>
<td>
Optional sampling temperature (0 to 1)
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>ChatCompletion</b> : Chat completion for any OpenAI-compatible /v1/chat/completions endpoint (OpenAI default, or any provider through base_url: Groq, OpenRouter, Together, DeepSeek, xAI, Perplexity, Ollama</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") ChatCompletion

Chat completion for any OpenAI-compatible /v1/chat/completions endpoint (OpenAI default, or any provider through base_url: Groq, OpenRouter, Together, DeepSeek, xAI, Perplexity, Ollama...).

Variables: prompt (required), model (default gpt-4o-mini), system, temperature, max_tokens, base_url (empty = OpenAI), api_key (empty = lib_AIConnector.openai_apikey.secret symbol).

The Build_Body / Build_Auth / Build_Uri steps build the request (JSON body, Bearer header, full URL) as hidden XML elements; the Call_Transaction step variables read them through sourceDefinition references.

Returns the provider response document (choices[0].message.content holds the answer).

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;api_key
</td>
<td>
Provider API key. Empty = the default key from the lib_AIConnector.openai_apikey.secret symbol (administration console). Prefer the symbol: pass a key only for a provider needing a different one.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;base_url
</td>
<td>
Base URL of any OpenAI-compatible provider (Mistral, Groq, OpenRouter, Together, DeepSeek, xAI, Perplexity, Ollama...). Empty = OpenAI. The sequence appends /chat/completions when missing.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Optional maximum number of tokens in the response
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
Model id understood by the provider: gpt-4o-mini, gpt-4.1, o4-mini (OpenAI), mistral-large-latest (Mistral), llama-3.3-70b-versatile (Groq), etc. Empty = provider default.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;prompt
</td>
<td>
The user prompt sent to the model
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;system
</td>
<td>
Optional system prompt (role / instructions) prepended to the user prompt
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;temperature
</td>
<td>
Sampling temperature, decimal 0 to 2 (provider dependent). Empty = provider default.
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>forms_HandleBatchPrompts</b> : This No Code action will handle ChatGPT prompts in batch mode</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") forms_HandleBatchPrompts

This No Code action will handle ChatGPT prompts in batch mode.

The action will use a CSV file uploaded in a No Code Studio (Forms) app and will execute all lines of this CSV file against the API.

The file format must have these columns

|title|definition_gpt|prompt_prefix|Prompt_suffix|prompt|model|max_tokens|temperature|top_p|frequency_penalty|presence_penalty|
|-----|--------------|-------------|-------------|------|-----|----------|-----------|-----|-----------------|----------------|
|optional|Optional   |A prefix to the prompt | the prompt itself | a suffix to the prompt | the model to be used | max number for tokens (words) | temperatuer (randomicity..) | optional |  optional | optional | 



<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;doc
</td>
<td>
The No Code app response doc
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;forms_email
</td>
<td>
The email where ChatGPT responses must be emailed to
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;originalDoc
</td>
<td>
The No Code app form
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>formssource_Prompt</b> : Use this source in a Grid to display ChatGPT reponses to a prompt</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") formssource_Prompt

Use this source in a Grid to display ChatGPT reponses to a prompt

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;forms_prompt
</td>
<td>
The prompt to ask to ChatGPT
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>GeminiMessage</b> : Chat completion through the Google Gemini API (official OpenAI-compatible endpoint /v1beta/openai/chat/completions)</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") GeminiMessage

Chat completion through the Google Gemini API (official OpenAI-compatible endpoint /v1beta/openai/chat/completions).

Variables: prompt (required), model (default gemini-2.5-flash), system, temperature, max_tokens, api_key (empty = lib_AIConnector.gemini_apikey.secret symbol).

Returns the provider response document (choices[0].message.content holds the answer).

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;api_key
</td>
<td>
Google AI API key. Empty = lib_AIConnector.gemini_apikey.secret symbol (administration console).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Maximum number of output tokens (optional).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
Gemini model id (default gemini-2.5-flash).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;prompt
</td>
<td>
User prompt sent to the model (required).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;system
</td>
<td>
Optional system instruction for the model.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;temperature
</td>
<td>
Sampling temperature (optional, 0-2).
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>HandleBatchPrompts</b></summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") HandleBatchPrompts



<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;batchFile
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;toEmail
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>MistralMessage</b> : Chat completion through the Mistral AI API (api</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") MistralMessage

Chat completion through the Mistral AI API (api.mistral.ai, OpenAI-compatible /v1/chat/completions).

Variables: prompt (required), model (default mistral-large-latest), system, temperature, max_tokens, api_key (empty = lib_AIConnector.mistral_apikey.secret symbol).

Returns the provider response document (choices[0].message.content holds the answer).

<span style="color:DarkGoldenRod">Variables</span>

<table>
<tr>
<th>
name
</th>
<th>
comment
</th>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;api_key
</td>
<td>
Mistral API key. Empty = lib_AIConnector.mistral_apikey.secret symbol (administration console).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Maximum number of tokens in the response (optional).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
Mistral model id (default mistral-large-latest); examples: mistral-small-latest, magistral-medium-latest, open-mistral-nemo.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;prompt
</td>
<td>
User prompt sent to the model (required).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;system
</td>
<td>
Optional system prompt (role / instructions).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;temperature
</td>
<td>
Sampling temperature (optional, 0-2).
</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>NR_AIChat</b> : Non-regression suite for AIChat: runs the validated test matrix (provider routing, system prompt, temperature, max_tokens truncation, model override) and reports PASS/FAIL per check</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") NR_AIChat

Non-regression suite for AIChat: runs the validated test matrix (provider routing, system prompt, temperature, max_tokens truncation, model override) and reports PASS/FAIL per check. Gemini is excluded (prepaid credits depleted, HTTP 402).
</p></blockquote></details>
</p></blockquote></details>

<details><summary><span style="color:DarkGoldenRod"><i>Mobile Application</i></span></summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/core/images/mobileapplication_color_16x16.png?raw=true "MobileApplication") Application

Describes the mobile application global properties

<details><summary><span style="color:DarkGoldenRod"><i>Pages</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/ngx/components/images/pagecomponent_color_16x16.png?raw=true "PageComponent") Page

My First Page as root page
</p></blockquote></details>
</p></blockquote></details>

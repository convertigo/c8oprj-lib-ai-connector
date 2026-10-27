


# lib_AIConnector

Shared library that serves the modern chat completion APIs of all major AI providers, and starts AgentRunner agent jobs (autonomous agents run in Kubernetes, see AgentRunner below).


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
| `file` | Optional uploaded file (image or PDF), multipart upload. Receives the temp file path when the request is multipart |
| `file_type` | Optional MIME type of the uploaded file (image/png, application/pdf...). Guessed from the file extension when empty |

Dispatch:

- `openai` without file -> `ChatCompletion` (any OpenAI-compatible endpoint through `base_url`)
- `openai` with file -> `OpenAIResponses` (Responses API + Files API, automatic routing)
- `anthropic` -> `AnthropicMessage`
- `gemini` -> `GeminiMessage`
- `mistral` -> `MistralMessage`
- unknown provider -> explicit applicative error (code 400, "Unknown provider 'X'. Supported providers: openai, anthropic, gemini, mistral.")

On success the AIChat output contains the model answer only (per provider shape: `content`, `text`...). On provider error the provider error object is copied to the output so the client sees the failure reason.

Example: `AIChat?provider=anthropic&model=claude-sonnet-4-5&prompt=Hello`.

Example with a file (multipart): curl -F provider=anthropic -F prompt="Read this document" -F file=@nda.pdf -F file_type=application/pdf <convertigo>/projects/lib_AIConnector/.json?__sequence=AIChat

## File uploads (images and PDFs) - binary pipelines, no base64

Every provider uploads files in binary through the Convertigo HTTP connector transactions (multipartFormData streaming); no base64 encoding is used anywhere in the library.

| Provider | Pipeline | Reference in the chat request |
|---|---|---|
| `openai` | `AI.UploadFile` (Files API, purpose vision for images / user_data for PDFs) -> `file_id` | `input_image` / `input_file` with `file_id` (Responses API) |
| `anthropic` | `Anthropic.UploadFile` (Files API) -> `file_id` | `file` source blocks (images and documents) |
| `gemini` | `Gemini.UploadStart` + `Gemini.UploadFile` (resumable upload, 3 calls with GenerateContent) | file URI in the message |
| `mistral` | `Mistral.UploadFile` -> `Mistral.FileUrl` (signed URL); PDFs add `Mistral.Ocr` (mistral-ocr-latest) | images: signed URL as `image_url`; PDFs: extracted markdown in the prompt |

## Provider sequences

- `ChatCompletion` - OpenAI-compatible chat completions. Default model `gpt-4o-mini`. Variables: prompt, model, system, temperature, max_tokens, base_url, api_key, file, file_type. `base_url` overrides the endpoint (any OpenAI-compatible API). PDF files are uploaded (Files API) and referenced by `file_id`; image files are rejected here: use AIChat, which routes images to `OpenAIResponses`.
- `OpenAIResponses` - OpenAI Responses API (`/v1/responses`) used when a file is attached (image or PDF): binary Files API upload then `input_image`/`input_file` with `file_id`. Default model `gpt-4o-mini`.
- `AnthropicMessage` - Anthropic native Messages API. Default model `claude-sonnet-4-5`. Variables: prompt, model, system, temperature, max_tokens, api_key, file, file_type. Files (PDF and images) go through the Anthropic Files API and are referenced by `file_id`.
- `GeminiMessage` - Google Gemini through its OpenAI-compatible endpoint (`/v1beta/openai/chat/completions`). Default model `gemini-2.5-flash`. Variables: prompt, model, system, temperature, max_tokens, api_key, file, file_type. Files use the Gemini resumable Files API upload.
- `MistralMessage` - Mistral AI chat completions (`api.mistral.ai/v1/chat/completions`). Default model `mistral-large-latest`. Variables: prompt, model, system, temperature, max_tokens, api_key, file, file_type. Images: binary Files API upload + signed URL (vision models such as `ministral-14b-latest` or `mistral-medium-latest`; the pixtral models are retired); PDFs: OCR-extracted markdown (mistral-ocr-latest).

Each sequence copies the provider response into its output via an XMLCopyStep.

## AgentRunner: agent jobs

AgentRunner runs autonomous AI agents (Mistral Vibe with a browser, a shell, document and vision tools) in Kubernetes, one isolated Job per task. A job is a doc in the `agentjobs` FullSync database (the `agentjobs` connector; the AgentRunner daemon watches the same CouchDB database), owned by the user who created it (`~c8oAcl`), so FullSync gives each user their own jobs only.

The three sequences are Private and need an authenticated context: call them from your application's own sequence (`SequenceStep`), in the user's session, where you decide who may start agents, with which model and budget.

| Sequence | Variables | Output |
|---|---|---|
| `AgentRunnerJob` | `prompt` (required), `api_key` (the client's LLM API key; empty = the `lib_AIConnector.agentrunner.api_key.secret` symbol), `api_key_name` (default `LITELLM_API_KEY`), `model` (catalog alias such as `glm` or `large4`; empty = cluster default), `max_price`, `max_turns`, `time_limit` (empty = cluster defaults), `scheduled_at` (ISO 8601, run later), `files` (multipart files given to the agent) | `{jobId, status: queued or scheduled, inputs}` |
| `AgentRunnerJobStatus` | `jobId` | `{job: {jobId, status, createdAt, scheduledAt, startedAt, finishedAt, model, progress, finalMessage, error, costUsd, outputs}}` |
| `AgentRunnerJobCancel` | `jobId` | `{jobId, status, cancelled}` |

- Statuses: `queued` / `scheduled` -> `running` -> `succeeded`, `failed`, `stopped` (a limit was reached; the agent still writes what it has), or `cancelling` -> `cancelled`.
- `progress` is live while the job runs: steps, tool calls, and the latest reasoning, messages and actions (`progress.history`). Poll `AgentRunnerJobStatus` every few seconds, or sync the doc with FullSync.
- `files` are attached as `input/<name>` and found by the agent in its working directory; the files the agent produces are attachments `output/<name>` (listed in `job.outputs`).
- The API key is encrypted by `EncryptAgentRunnerSecret` (AES-256-GCM) before it is stored: only the AgentRunner daemon can read it, and it hands it to that job's agent only.
- A job of another user answers `job not found`, for both status and cancel.
- Tests: `NR_AgentRunnerJob` (start with a file, status, cancel, isolation between two users; no LLM cost) and `NR_AgentRunnerJobLive` (a real job run to the end, a few cents). Both delete their test jobs.

## Symbols

API keys are never stored in the project. Each provider reads its key from a symbol at runtime; pass `api_key` to override (for example for tests):

| Symbol | Used by |
|---|---|
| `lib_AIConnector.openai_apikey.secret` | OpenAI (`ChatCompletion`) |
| `lib_AIConnector.anthropic_apikey.secret` | Anthropic (`AnthropicMessage`) |
| `lib_AIConnector.gemini_apikey.secret` | Google Gemini (`GeminiMessage`) |
| `lib_AIConnector.mistral_apikey.secret` | Mistral (`MistralMessage`) |
| `lib_AIConnector.agentrunner.key.secret` | AgentRunner encryption key, required: the `AGENTRUNNER_SECRET_KEY` of the cluster's `agentrunner-key` Secret (`EncryptAgentRunnerSecret`; or the `AGENTRUNNER_SECRET_KEY` environment variable of the server) |
| `lib_AIConnector.agentrunner.api_key.secret` | AgentRunner default LLM API key, optional: used by `AgentRunnerJob` when `api_key` is empty |

Set their values in the administration console.



For more technical informations : [documentation](./project.md)

- [Installation](#installation)
- [Mobile Library](#mobile-library)


## Installation

1. In your Convertigo Studio click on ![](https://github.com/convertigo/convertigo/blob/develop/eclipse-plugin-studio/icons/studio/project_import.gif?raw=true "Import a project in treeview") to import a project in the treeview
2. In the import wizard

   ![](https://github.com/convertigo/convertigo/blob/develop/eclipse-plugin-studio/tomcat/webapps/convertigo/templates/ftl/project_import_wzd.png?raw=true "Import Project")
   
   paste the text below into the `Project remote URL` field:
   <table>
     <tr><td>Usage</td><td>Click the copy button at the end of the line</td></tr>
     <tr><td>To contribute</td><td>

     ```
     lib_AIConnector=https://github.com/convertigo/c8oprj-lib-ai-connector.git:branch=master
     ```
     </td></tr>
     <tr><td>To simply use</td><td>

     ```
     lib_AIConnector=https://github.com/convertigo/c8oprj-lib-ai-connector/archive/master.zip
     ```
     </td></tr>
    </table>
3. Click the `Finish` button. This will automatically import the __lib_AIConnector__ project


## Mobile Library

Describes the mobile application global properties





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
- `MistralMessage` - Mistral AI chat completions (`api.mistral.ai/v1/chat/completions`). Default model `mistral-large-latest`. Variables: prompt, model, system, temperature, max_tokens, api_key, file, file_type. Images: binary Files API upload + signed URL (vision models such as pixtral-12b); PDFs: OCR-extracted markdown (mistral-ocr-latest).

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


see [readme](https://github.com/convertigo/c8oprj-lib-ai-connector/tree/master#readme)
</p></blockquote></details>

<details><summary><span style="color:DarkGoldenRod"><i>Connectors</i></span></summary><blockquote><p>


<details><summary><b>AI</b> : OpenAI-compatible HTTP connector</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") AI

OpenAI-compatible HTTP connector. Default origin api.openai.com/v1 (ChatCompletions, UploadFile for the Files API).

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

<details><summary><b>Responses</b> : POST /v1/responses: OpenAI Responses API (recommended multimodal endpoint)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") Responses

POST /v1/responses: OpenAI Responses API (recommended multimodal endpoint). Accepts input_image.file_id (vision files) and input_file.file_id (PDF files) uploaded through the Files API, so images and PDFs travel as binary uploads instead of base64. The sequence passes the JSON body through __body.

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

</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>UploadFile</b> : POST /v1/files: OpenAI Files API upload (multipart)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") UploadFile

POST /v1/files: OpenAI Files API upload (multipart). The connector streams the file as a binary part (variable file, Do File Upload Mode = multipartFormData). JsonHttpTransaction parses the response so the sequence can extract the id (file_id).

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;file
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;purpose
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>Anthropic</b> : Anthropic native API (api</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") Anthropic

Anthropic native API (api.anthropic.com): Messages endpoint.

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


<details><summary><b>Messages</b> : POST /v1/messages: Anthropic native Messages API</summary><blockquote><p>


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

<details><summary><b>UploadFile</b> : POST /v1/files: Anthropic Files API upload (beta, multipart)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") UploadFile

POST /v1/files: Anthropic Files API upload (beta, multipart). The connector streams the file as a binary part. JsonHttpTransaction parses the response so the sequence can extract the id (file_id).

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_anthropic_beta
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_anthropic_version
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_api_key
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;file
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;metadata
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>
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


<details><summary><b>GenerateContent</b> : POST /v1beta/openai/chat/completions (Gemini OpenAI-compatible endpoint)</summary><blockquote><p>


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

<details><summary><b>UploadFile</b> : POST to the upload URL returned by UploadStart: sends the raw binary file as the request body (x-goog-upload-command=upload, finalize)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/httptransaction_color_16x16.png?raw=true "HttpTransaction") UploadFile

POST to the upload URL returned by UploadStart: sends the raw binary file as the request body (x-goog-upload-command=upload, finalize). The sequence passes the file path through __body with Do File Upload Mode = multipartFormData (body mode: file content sent as body), and the MIME type through the reserved __contentType variable. JsonHttpTransaction parses the final file JSON (file.uri) so the sequence can reference the uploaded file.

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__contentType
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_content_type
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_api_key
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_upload_command
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_upload_offset
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__uri
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>UploadStart</b> : POST https://generativelanguage</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/httptransaction_color_16x16.png?raw=true "HttpTransaction") UploadStart

POST https://generativelanguage.googleapis.com/upload/v1beta/files: resumable upload session start (x-goog-upload-protocol=resumable, x-goog-upload-command=start, x-goog-upload-content-type from the sequence scope). The response x-goog-upload-url header (httpInfo) gives the upload target URL.

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_api_key
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_upload_command
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_upload_content_type
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_x_goog_upload_protocol
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__uri
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>
</p></blockquote></details>
</p></blockquote></details>

<details><summary><b>Mistral</b> : Mistral AI API (api</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/connectors/images/httpconnector_color_16x16.png?raw=true "HttpConnector") Mistral

Mistral AI API (api.mistral.ai), OpenAI-compatible /v1/chat/completions endpoint.

<details><summary><span style="color:DarkGoldenRod"><i>Transactions</i></span></summary><blockquote><p>


<details><summary><b>ChatCompletions</b> : POST /v1/chat/completions (Mistral OpenAI-compatible endpoint)</summary><blockquote><p>


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

<details><summary><b>FileUrl</b> : GET /v1/files/{file_id}/url: returns the signed URL of an uploaded Mistral file (used before OCR)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") FileUrl

GET /v1/files/{file_id}/url: returns the signed URL of an uploaded Mistral file (used before OCR).

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;file_id
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>Ocr</b> : POST /v1/ocr: Mistral OCR extraction (model mistral-ocr-latest, document pointing to the signed file URL)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") Ocr

POST /v1/ocr: Mistral OCR extraction (model mistral-ocr-latest, document pointing to the signed file URL). Body passed through __body.

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

</td>
</tr>
</table>

</p></blockquote></details>

<details><summary><b>UploadFile</b> : POST /v1/files: Mistral Files API upload (purpose=ocr, multipart)</summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/transactions/images/jsonhttptransaction_color_16x16.png?raw=true "JsonHttpTransaction") UploadFile

POST /v1/files: Mistral Files API upload (purpose=ocr, multipart). The connector streams the file as a binary part. JsonHttpTransaction parses the response so the sequence can extract the id.

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;__header_Authorization
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;file
</td>
<td>

</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableHttpVariable" >&nbsp;purpose
</td>
<td>

</td>
</tr>
</table>

</p></blockquote></details>
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

Variables: provider (openai|anthropic|gemini|mistral, default openai), prompt (required), model, system, temperature, max_tokens, api_key, base_url (openai only), file (optional image or PDF, multipart upload), file_type.

Dispatch: openai without file -> ChatCompletion (any OpenAI-compatible endpoint); openai with file -> OpenAIResponses (Responses API, automatic routing); anthropic -> AnthropicMessage; gemini -> GeminiMessage; mistral -> MistralMessage; unknown provider -> explicit applicative error (code 400) built by the If_unknown branch.

Output: the model answer only on success (per provider shape); the provider error object on failure.

Files API architecture: every upload goes through the Convertigo HTTP connector transactions (multipartFormData streaming, no base64 anywhere):
- openai: AI.UploadFile purpose=vision/user_data -> file_id in input_image/input_file (Responses API)
- anthropic: Anthropic.UploadFile (files API beta) -> file_id in the chat message (PDF and images)
- gemini: Gemini.UploadStart + Gemini.UploadFile (resumable upload, x-goog headers) -> file URI in the chat message
- mistral: Mistral.UploadFile (purpose=ocr) -> Mistral.FileUrl (signed URL) -> image_url for images (vision models such as pixtral-12b); PDFs add Mistral.Ocr (mistral-ocr-latest) and inject the extracted markdown in the prompt

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
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

Variables: prompt (required), model (default claude-sonnet-4-5), system, temperature, max_tokens (default 1024), api_key (empty = lib_AIConnector.anthropic_apikey.secret symbol), file (optional image or PDF), file_type.

Files (PDF and images) go through the Anthropic Files API (binary multipart upload) and are referenced by file_id in the Messages request; no base64.

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
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

Variables: prompt (required), model (default mistral-large-latest), system, temperature, max_tokens, api_key (empty = lib_AIConnector.mistral_apikey.secret symbol), file, file_type.

Files are uploaded in binary through the Mistral Files API (multipart, no base64 in memory): images use the signed URL as image_url (vision models), PDFs are OCR-extracted first (mistral-ocr-latest). Returns the provider response document (choices[0].message.content holds the answer).

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
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
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

<details><summary><b>OpenAIResponses</b> : Chat completion through the OpenAI Responses API (/v1/responses)</summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/sequences/images/genericsequence_color_16x16.png?raw=true "GenericSequence") OpenAIResponses

Chat completion through the OpenAI Responses API (/v1/responses).

Variables: prompt (required), model (default gpt-4o-mini), system, temperature, max_tokens, api_key (empty = lib_AIConnector.openai_apikey.secret symbol), file, file_type.

Files are uploaded in binary through the OpenAI Files API (multipart, no base64 in memory): images use purpose=vision and input_image.file_id, PDFs use purpose=user_data and input_file.file_id. Returns the provider response document (output[0].content[0].text holds the answer; AIChat extracts it).

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
OpenAI API key. Empty = lib_AIConnector.openai_apikey.secret symbol (administration console).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file
</td>
<td>
Optional uploaded file (image or PDF) sent to the model. Receives the temp file path when multipart upload is used.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;file_type
</td>
<td>
MIME type of the uploaded file (image/png, image/jpeg, application/pdf...). Optional; guessed from the file extension when empty.
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;max_tokens
</td>
<td>
Maximum number of tokens in the response (optional; sent as max_output_tokens).
</td>
</tr>
<tr>
<td>
<img src="https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/variables/images/variable_color_16x16.png?raw=true "  alt="RequestableVariable" >&nbsp;model
</td>
<td>
OpenAI model id (default gpt-4o-mini); examples: gpt-4.1, gpt-4o, o4-mini.
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
</p></blockquote></details>

<details><summary><span style="color:DarkGoldenRod"><i>Mobile Application</i></span></summary><blockquote><p>


## ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/core/images/mobileapplication_color_16x16.png?raw=true "MobileApplication") Application

Describes the mobile application global properties

<details><summary><span style="color:DarkGoldenRod"><i>Pages</i></span></summary><blockquote><p>


### ![](https://github.com/convertigo/convertigo/blob/develop/engine/src/com/twinsoft/convertigo/beans/ngx/components/images/pagecomponent_color_16x16.png?raw=true "PageComponent") Page

My First Page as root page
</p></blockquote></details>
</p></blockquote></details>

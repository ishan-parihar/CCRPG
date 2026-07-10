/**
 * VeilFilter — re-export from the shared location.
 *
 * The VeilFilter is needed by BOTH client code (LLMClient) and server
 * code (BFF +server.ts endpoints in src/routes/api/). It was originally
 * in src/infra/llm/ but that path is client-only (infra/ has Node built-in
 * imports in sibling files like SaveRepository.ts). The shared location
 * at src/shared/llm/ is importable by both client and server.
 *
 * Existing imports from '@infra/llm/VeilFilter.js' continue to work via
 * this re-export.
 */
export { filterInput, filterOutput, stripNonAsciiScriptLeaks } from '$shared/llm/VeilFilter.js';

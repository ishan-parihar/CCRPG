<script lang="ts">
  /**
   * /setup route — LLM configuration status + connection test.
   * Parity with CLI 'mysterium setup' (adapted for BFF architecture).
   *
   * The WebUI uses a BFF (server-side LLM proxy) — the API key is held server-side
   * in env vars. This route shows the BFF's LLM config status and lets the user
   * test the connection. For client-side LLM config (parity with CLI), use the CLI.
   */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Seo from '$lib/components/Seo.svelte';
  import RouteShell from '$lib/components/RouteShell.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import Stack from '$lib/components/Stack.svelte';
  import Spinner from '$lib/components/Spinner.svelte';

  type Status = 'idle' | 'checking' | 'ok' | 'error';
  let status: Status = $state('idle');
  let configInfo = $state<{ provider: string; model: string; hasKey: boolean } | null>(null);
  let errorMsg = $state('');

  async function checkConfig() {
    status = 'checking';
    errorMsg = '';
    try {
      // The BFF exposes config status via a lightweight endpoint.
      // ponytail: we probe /api/llm/chat with a tiny test message.
      // If it returns ok, the LLM is configured. If 500, misconfigured.
      const res = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          maxTokens: 1,
        }),
      });
      if (res.ok) {
        status = 'ok';
        // Best-effort: read provider info from response headers if available
        configInfo = {
          provider: res.headers.get('x-llm-provider') ?? 'BFF',
          model: res.headers.get('x-llm-model') ?? 'configured',
          hasKey: true,
        };
      } else if (res.status === 500) {
        status = 'error';
        errorMsg = 'LLM is not configured on the server. Set LLM_API_KEY (or OPENAI_API_KEY / ANTHROPIC_API_KEY) + LLM_MODEL + LLM_BASE_URL in the server environment.';
      } else {
        status = 'error';
        errorMsg = `Server returned ${res.status}`;
      }
    } catch (err) {
      status = 'error';
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  onMount(() => {
    if (!browser) return;
    checkConfig();
  });
</script>

<Seo
  title="Setup"
  description="Check LLM configuration and test the connection."
  indexable={false}
/>

<RouteShell title="Setup" back="/">
  <Stack gap="space-5">
    <Card padding="space-5">
      <Stack gap="space-3">
        <h2 class="section-title">LLM Status</h2>
        <p class="setup-text">
          The WebUI uses a server-side BFF (Backend-For-Frontend) to proxy LLM calls.
          The API key is held in server environment variables — it never reaches your browser.
        </p>
        <div class="status-row">
          <span class="status-label">Connection:</span>
          {#if status === 'checking'}
            <Spinner size="sm" />
          {:else if status === 'ok'}
            <Badge variant="success">Connected</Badge>
          {:else if status === 'error'}
            <Badge variant="danger">Not configured</Badge>
          {:else}
            <Badge variant="default">Unknown</Badge>
          {/if}
        </div>
        {#if configInfo}
          <div class="status-row">
            <span class="status-label">Provider:</span>
            <span class="status-value">{configInfo.provider}</span>
          </div>
          <div class="status-row">
            <span class="status-label">Model:</span>
            <span class="status-value">{configInfo.model}</span>
          </div>
          <div class="status-row">
            <span class="status-label">API key:</span>
            <Badge variant="success">Set (server-side)</Badge>
          </div>
        {/if}
        {#if status === 'error'}
          <div class="error-box">
            <p class="error-text">{errorMsg}</p>
          </div>
        {/if}
        <Button variant="primary" onclick={checkConfig} loading={status === 'checking'}>
          Test Connection
        </Button>
      </Stack>
    </Card>

    <Card padding="space-5">
      <Stack gap="space-3">
        <h2 class="section-title">Configuration</h2>
        <p class="setup-text">
          To configure the LLM, set these environment variables on the server:
        </p>
        <pre class="env-list"><code>LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1</code></pre>
        <p class="setup-text">
          Or use provider-specific vars: <code>OPENAI_API_KEY</code>,
          <code>ANTHROPIC_API_KEY</code>, etc.
        </p>
        <p class="setup-note">
          For client-side LLM configuration (CLI-style), use the CLI:
          <code>mysterium setup</code>
        </p>
      </Stack>
    </Card>
  </Stack>
</RouteShell>

<style>
  .section-title {
    font-family: var(--mysterium-font-display);
    font-size: var(--mysterium-text-md);
    font-weight: 600;
    color: var(--mysterium-accent);
    margin: 0;
    letter-spacing: var(--mysterium-tracking-wide);
  }

  .setup-text {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg);
    line-height: var(--mysterium-leading-relaxed);
    margin: 0;
  }

  .setup-text code,
  .setup-note code {
    background: var(--mysterium-surface);
    padding: 2px 6px;
    border-radius: var(--mysterium-radius-sm);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-accent);
  }

  .setup-note {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    color: var(--mysterium-fg-muted);
    font-style: italic;
    line-height: var(--mysterium-leading-relaxed);
    margin: 0;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--mysterium-space-3);
  }

  .status-label {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg-muted);
  }

  .status-value {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg);
    font-weight: 500;
  }

  .env-list {
    background: var(--mysterium-bg);
    border: 1px solid var(--mysterium-border);
    border-radius: var(--mysterium-radius);
    padding: var(--mysterium-space-3);
    margin: 0;
    overflow-x: auto;
  }

  .env-list code {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-fg);
    line-height: var(--mysterium-leading-relaxed);
  }

  .error-box {
    background: var(--mysterium-danger-soft);
    border: 1px solid var(--mysterium-danger);
    border-radius: var(--mysterium-radius);
    padding: var(--mysterium-space-3);
  }

  .error-text {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    color: var(--mysterium-danger-fg);
    margin: 0;
    line-height: var(--mysterium-leading-relaxed);
  }
</style>

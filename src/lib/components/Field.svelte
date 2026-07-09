<script lang="ts">
  /**
   * Field — wraps Input/Select with label + error + help text.
   * Provides consistent spacing and accessibility wiring.
   */
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    error?: string;
    help?: string;
    required?: boolean;
    id?: string;
    class?: string;
    children: Snippet;
  }

  let { label, error, help, required = false, id, class: className = '', children }: Props = $props();

  const fieldId = $derived(id ?? `field-${Math.random().toString(36).slice(2, 9)}`);
  const errorId = $derived(`${fieldId}-error`);
  const helpId = $derived(`${fieldId}-help`);
</script>

<div class="field {className}">
  <label class="field-label" for={fieldId}>
    {label}
    {#if required}<span class="required" aria-hidden="true">*</span>{/if}
  </label>
  {@render children({ id: fieldId, ariaDescribedby: error ? errorId : (help ? helpId : undefined), ariaInvalid: error !== undefined })}
  {#if help && !error}<p class="field-help" id={helpId}>{help}</p>{/if}
  {#if error}<p class="field-error" id={errorId} role="alert">{error}</p>{/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .field-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    font-weight: 500;
    color: var(--ccrpg-fg);
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .required {
    color: var(--ccrpg-danger);
    margin-left: var(--ccrpg-space-1);
  }

  .field-help {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-fg-muted);
  }

  .field-error {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-danger);
  }
</style>

<script lang="ts">
  /**
   * Input — text input with label, error, and Veil-compliant styling.
   * Replaces 12 hand-rolled inputs in /recover.
   */
  interface Props {
    value: string;
    oninput: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
    label?: string;
    error?: string;
    placeholder?: string;
    maxlength?: number;
    disabled?: boolean;
    required?: boolean;
    id?: string;
    autocomplete?: string;
    ariaInvalid?: boolean;
  }

  let {
    value,
    oninput,
    type = 'text',
    label,
    error,
    placeholder,
    maxlength,
    disabled = false,
    required = false,
    id,
    autocomplete,
    ariaInvalid,
  }: Props = $props();

  const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
  const errorId = $derived(`${inputId}-error`);
  const isInvalid = $derived(ariaInvalid ?? (error !== undefined && error.length > 0));
</script>

{#if type === 'textarea'}
  {#if label}<label class="input-label" for={inputId}>{label}{#if required}<span class="required" aria-hidden="true">*</span>{/if}</label>{/if}
  <textarea
    class="input"
    id={inputId}
    {placeholder}
    {maxlength}
    {disabled}
    {required}
    autocomplete={autocomplete}
    aria-invalid={isInvalid}
    aria-describedby={error ? errorId : undefined}
    oninput={(e) => oninput(e.currentTarget.value)}
  >{value}</textarea>
  {#if error}<p class="input-error" id={errorId} role="alert">{error}</p>{/if}
{:else}
  {#if label}<label class="input-label" for={inputId}>{label}{#if required}<span class="required" aria-hidden="true">*</span>{/if}</label>{/if}
  <input
    class="input"
    id={inputId}
    type={type}
    value={value}
    {placeholder}
    {maxlength}
    {disabled}
    {required}
    autocomplete={autocomplete}
    aria-invalid={isInvalid}
    aria-describedby={error ? errorId : undefined}
    oninput={(e) => oninput(e.currentTarget.value)}
  />
  {#if error}<p class="input-error" id={errorId} role="alert">{error}</p>{/if}
{/if}

<style>
  .input-label {
    display: block;
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    font-weight: 500;
    color: var(--ccrpg-fg);
    margin-bottom: var(--ccrpg-space-2);
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .required {
    color: var(--ccrpg-danger);
    margin-left: var(--ccrpg-space-1);
  }

  .input {
    width: 100%;
    padding: var(--ccrpg-space-3) var(--ccrpg-space-4);
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius);
    color: var(--ccrpg-fg);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-base);
    transition: border-color var(--ccrpg-duration-fast) var(--ccrpg-ease),
                box-shadow var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .input::placeholder {
    color: var(--ccrpg-fg-muted);
    opacity: 0.7;
  }

  .input:focus {
    outline: none;
    border-color: var(--ccrpg-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ccrpg-accent) 20%, transparent);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input[aria-invalid='true'] {
    border-color: var(--ccrpg-danger);
  }

  textarea.input {
    min-height: 6rem;
    resize: vertical;
    line-height: var(--ccrpg-leading-normal);
  }

  .input-error {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    color: var(--ccrpg-danger);
    margin-top: var(--ccrpg-space-1);
  }
</style>

<script lang="ts">
  /**
   * <Seo> — shared SEO + social meta tags.
   *
   * Audit fix A1+A2: Most routes had <title> but no description or OG tags.
   * This component provides a single source of truth for per-route SEO.
   *
   * Usage:
   *   <Seo title="Settings" description="Adjust accessibility and privacy" />
   */

  type Props = {
    /** Page title (will be suffixed with "— Mysterium"). */
    title: string;
    /** Meta description (≤160 chars recommended). */
    description: string;
    /** Optional path to an OG image (absolute or root-relative). */
    ogImage?: string;
    /** Optional: set to false to discourage indexing (e.g. /play). */
    indexable?: boolean;
  };

  let { title, description, ogImage = '/icons/icon-512.png', indexable = true }: Props = $props();

  const fullTitle = $derived(`${title} — Mysterium`);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if !indexable}
    <meta name="robots" content="noindex, nofollow" />
  {/if}

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Mysterium" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

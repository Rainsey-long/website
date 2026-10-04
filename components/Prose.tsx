/**
 * Prose — repo-authored Markdown rendered in reading typography. The HTML
 * comes only from content/ files in this repository (lib/content.ts), never
 * from a visitor or the admin, which is what makes innerHTML acceptable here.
 */
export default function Prose({ html }: { html: string }) {
  return <div className="prose reading" dangerouslySetInnerHTML={{ __html: html }} />;
}

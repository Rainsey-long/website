/** Structured data. Values are our own objects; `<` is escaped so no string can close the script tag. */
export default function JsonLd({ data }: { data: object[] }) {
  return (
    <>
      {data.map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}

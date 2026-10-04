import Breadcrumbs from "@/components/Breadcrumbs";
import { FEEDS } from "@/lib/ics";
import { absolute, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Calendar feeds: moon phases, retrogrades, Khmer holy days", description: "Subscribe in Google Calendar, Apple Calendar or Outlook to moon phases, retrogrades, eclipses, Khmer Buddhist holy days and festivals.", path: "/feeds" });

export default function Feeds() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Calendar feeds", href: "/feeds" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Calendar feeds</h1>
        <p className="reading mt-3">Add these to the calendar you already use. They update themselves, and there is nothing to sign up for.</p>
        <ul className="mt-6">
          {Object.entries(FEEDS).map(([name, f]) => {
            const https = absolute(`/feeds/${name}.ics`);
            const webcal = https.replace(/^https?:/, "webcal:");
            return (
              <li key={name} className="border-b border-rule py-4">
                <h2 className="text-h3">{f.title}</h2>
                <p className="mt-1 text-muted">{f.about}</p>
                <p className="mt-3 flex flex-wrap gap-3">
                  <a className="btn-secondary" href={webcal}>Subscribe</a>
                  <a className="btn-secondary" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
                </p>
                <p className="mt-2 text-small text-muted break-all">{https}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

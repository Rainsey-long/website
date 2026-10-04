import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, FEATURES, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { longDate } from "@/lib/dates";

const UPDATED = "2026-10-04";
const META = {
  en: { title: "Privacy", description: `How ${SITE_NAME} handles your data: birth details stay in your browser, no accounts, minimal analytics.` },
  km: { title: "ឯកជនភាព", description: `របៀបដែល ${SITE_NAME} គ្រប់គ្រងទិន្នន័យរបស់អ្នក៖ ព័ត៌មានកំណើតនៅតែក្នុងកម្មវិធីរុករករបស់អ្នក គ្មានគណនី និងការវិភាគតិចតួចបំផុត។` },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/privacy" });
}

export default async function Privacy() {
  const lang = await getLang();
  if (lang === "km") {
    const mail = <a href={`mailto:${CONTACT_EMAIL}`} lang="en">{CONTACT_EMAIL}</a>;
    return (
      <TextPage title={META.km.title} path="/privacy" updated={longDate(UPDATED, "km")}>
        <p className="text-small text-muted">ទំព័រនេះជាការបកប្រែ។ ប្រសិនបើកំណែភាសាខ្មែរ និងភាសាអង់គ្លេសខុសគ្នា កំណែភាសាអង់គ្លេសជាកំណែដែលមានអានុភាព។</p>
        <h2>សេចក្ដីសង្ខេប</h2>
        <p>យើងមិនសុំឲ្យអ្នកចុះឈ្មោះទេ ហើយព័ត៌មានកំណើតដែលអ្នកវាយបញ្ចូលក្នុងឧបករណ៍របស់យើង មិនដែលចេញពីឧបករណ៍របស់អ្នកឡើយ។ ការគណនាដំណើរការនៅក្នុងកម្មវិធីរុករករបស់អ្នក។</p>
        <h2>អ្វីដែលនៅលើឧបករណ៍របស់អ្នក</h2>
        <p>ប្រសិនបើអ្នករក្សាទុករាសីរបស់អ្នក ឬជ្រើសរើសរូបរាងពណ៌ កម្មវិធីរុករករបស់អ្នករក្សាជម្រើសនោះក្នុងកន្លែងផ្ទុកក្នុងស្រុករបស់វា។ អ្នកអាចលុបវាបានគ្រប់ពេល ឬប្រើ «ប្ដូររាសី» នៅលើទំព័រដើម។</p>
        <h2>ខូគីដែលយើងដាក់</h2>
        <p>ខូគីចំណូលចិត្តតូចៗពីរ ដែលជារបស់យើងផ្ទាល់ និងមិនដែលចែករំលែក៖ <code lang="en">traditions</code> ចងចាំប្រពៃណីដែលអ្នកបានជ្រើសរើសមើល ហើយ <code lang="en">tz</code> រក្សាឈ្មោះតំបន់ម៉ោងរបស់អ្នក ដើម្បីឲ្យ «ថ្ងៃនេះ» ត្រូវនឹងប្រតិទិនរបស់អ្នក។ ខូគីទាំងពីរនេះមិនកំណត់អត្តសញ្ញាណអ្នកទេ។</p>
        <h2>មតិយោបល់</h2>
        <p>ប្រសិនបើអ្នកប្រាប់យើងថាការទស្សន៍ទាយមួយមានប្រយោជន៍ ឬអត់ យើងរក្សាទុកទំព័រ ចម្លើយរបស់អ្នក និងមតិណាមួយដែលអ្នកសរសេរ។ យើងមិនរក្សាទុកអាសយដ្ឋាន IP ឬអ្វីដែលកំណត់អត្តសញ្ញាណអ្នកឡើយ។</p>
        <h2>ការវិភាគ</h2>
        <p>{FEATURES.CF_ANALYTICS_TOKEN ? "យើងប្រើ Cloudflare Web Analytics ដើម្បីរាប់ចំនួនអ្នកចូលមើល។ វាមិនប្រើខូគី ហើយមិនតាមដានអ្នកពីគេហទំព័រមួយទៅគេហទំព័រមួយទេ។" : "យើងអាចនឹងប្រើ Cloudflare Web Analytics ដើម្បីរាប់ចំនួនអ្នកចូលមើល។ វាមិនប្រើខូគី ហើយមិនតាមដានអ្នកពីគេហទំព័រមួយទៅគេហទំព័រមួយទេ។"}</p>
        <h2>ការផ្សាយពាណិជ្ជកម្ម</h2>
        <p>{FEATURES.ADS_ENABLED ? "យើងបង្ហាញការផ្សាយពាណិជ្ជកម្មពីបណ្ដាញភាគីទីបី។ បណ្ដាញទាំងនោះអាចប្រើខូគី។ អ្នកចូលមើលនៅតំបន់ EEA និងចក្រភពអង់គ្លេស ត្រូវបានសុំការយល់ព្រមជាមុនសិន។" : "បច្ចុប្បន្ននេះ យើងមិនបង្ហាញការផ្សាយពាណិជ្ជកម្មទេ។ ប្រសិនបើរឿងនេះផ្លាស់ប្ដូរ ទំព័រនេះនឹងពន្យល់ថាបណ្ដាញផ្សាយពាណិជ្ជកម្មប្រមូលអ្វីខ្លះ និងរបៀបជ្រើសរើស ហើយអ្នកចូលមើលនៅតំបន់ EEA និងចក្រភពអង់គ្លេស នឹងត្រូវបានសុំការយល់ព្រមជាមុនសិន។"}</p>
        <h2>ទំនាក់ទំនង</h2>
        <p>សំណួរអំពីឯកជនភាព៖ {mail}។</p>
      </TextPage>
    );
  }
  return (
    <TextPage title="Privacy" path="/privacy" updated={longDate(UPDATED)}>
      <h2>The short version</h2>
      <p>We don&apos;t ask you to sign up, and the birth details you type into our tools never leave your device. The calculations run in your browser.</p>
      <h2>What stays on your device</h2>
      <p>If you save your sign or choose a theme, your browser keeps that choice in its local storage. You can clear it at any time, or use &quot;Change sign&quot; on the homepage.</p>
      <h2>Cookies we set</h2>
      <p>Two small preference cookies, both first-party and never shared: <code>traditions</code> remembers which traditions you chose to see, and <code>tz</code> holds your time zone name so &quot;today&quot; matches your calendar. Neither identifies you.</p>
      <h2>Feedback</h2>
      <p>If you tell us whether a reading was helpful, we store the page, your answer and any comment you write. We don&apos;t store your IP address or anything that identifies you.</p>
      <h2>Analytics</h2>
      <p>{FEATURES.CF_ANALYTICS_TOKEN ? "We use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across sites." : "We may use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across sites."}</p>
      <h2>Advertising</h2>
      <p>{FEATURES.ADS_ENABLED ? "We show ads from third-party networks. Those networks may use cookies. Visitors in the EEA and UK are asked for consent first." : "We don't show ads at the moment. If that changes, this page will explain what the ad networks collect and how to choose, and visitors in the EEA and UK will be asked for consent first."}</p>
      <h2>Contact</h2>
      <p>Questions about privacy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </TextPage>
  );
}

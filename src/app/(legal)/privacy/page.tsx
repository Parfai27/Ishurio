import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Privacy policy", description: "How Ishurio collects, uses and protects personal data." };

export default function PrivacyPage() {
  const mail = `mailto:${LEGAL.contact}`;
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="updated">Last updated {LEGAL.updated}</p>

      <p>
        {LEGAL.product} is school management software run by {LEGAL.owner} in {LEGAL.country}. This policy explains
        what personal data {LEGAL.product} handles, why, and the choices you have. It is written to follow Rwanda&apos;s
        Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy.
      </p>

      <h2>Who is responsible for your data</h2>
      <ul>
        <li>
          <strong>Your school</strong> decides what pupil, parent and staff records go into {LEGAL.product} and why. For
          that data the school is the controller and {LEGAL.product} processes it on the school&apos;s behalf. Requests
          about a pupil&apos;s records should go to the school first.
        </li>
        <li>
          <strong>{LEGAL.owner}</strong> is the controller for data about visitors to this website and for anyone who
          writes to ask for a demo.
        </li>
      </ul>

      <h2>What we collect</h2>
      <h3>Accounts</h3>
      <p>For administrators, teachers, bursars and parents: name, email address, an optional phone number, the role, and a password stored only as a one-way hash.</p>
      <h3>Pupil records entered by the school</h3>
      <ul>
        <li>Name, admission number, gender, date of birth and class</li>
        <li>Daily attendance, marks per subject and term, and report card grades</li>
        <li>Fee invoices and payments recorded by the bursar (amount, method, reference). {LEGAL.product} does not take card or mobile money payments itself.</li>
        <li>The parent or guardian linked to each pupil</li>
      </ul>
      <h3>Messages</h3>
      <p>Notices the school sends, and, when the school turns on SMS, the parents&apos; phone numbers the text is sent to.</p>
      <h3>Technical data</h3>
      <p>When you visit, our hosting provider records standard server logs such as your IP address, browser type and the pages requested, to keep the service secure and running.</p>

      <h2>Why we use it</h2>
      <ul>
        <li>To run the service the school signed up for: registers, results, report cards, fees and notices. This is needed to perform our agreement with the school.</li>
        <li>To keep accounts secure and the service available, which is our legitimate interest and yours.</li>
        <li>To answer a demo request you send us, with your consent.</li>
      </ul>
      <p>We do not sell personal data, show advertising, or use it to build profiles for marketing.</p>

      <h2>Children&apos;s data</h2>
      <p>
        Most pupils are under 18. Their records are entered and managed by their school, and only the school&apos;s staff
        and each pupil&apos;s own linked parent or guardian can see them. A parent&apos;s login shows only their own
        children.
      </p>

      <h2>Who we share it with</h2>
      <p>Only with service providers that run {LEGAL.product}, each under its own data protection terms:</p>
      <table>
        <thead><tr><th>Provider</th><th>What for</th><th>Data involved</th></tr></thead>
        <tbody>
          <tr><td>Vercel</td><td>Hosting the website and app</td><td>All app data in transit, server logs</td></tr>
          <tr><td>Neon</td><td>Database hosting</td><td>All stored records</td></tr>
          <tr><td>Africa&apos;s Talking</td><td>Sending SMS, only when the school turns it on</td><td>Parents&apos; phone numbers and the message text</td></tr>
          <tr><td>Google Fonts</td><td>Loading the typeface on the public website</td><td>Your IP address and browser details</td></tr>
        </tbody>
      </table>
      <p>
        Some of these providers store or process data outside {LEGAL.country}. Where that happens we rely on their
        contractual safeguards for international transfers. We share data with authorities only when the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        School records are kept for as long as the school uses {LEGAL.product}. When a school leaves, its data is deleted
        within 90 days unless it asks us to export it first. Server logs are kept for a short period by our hosting
        provider. Demo request emails are deleted once they are no longer needed.
      </p>

      <h2>How we protect it</h2>
      <p>
        Connections are encrypted (HTTPS), passwords are hashed, every page checks the user&apos;s role before showing
        data, and access to the database is restricted. No system is perfectly secure; if a breach affects your data we
        will tell the school and the authorities as the law requires.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see the personal data held about you, to correct it, to have it deleted, to restrict or object to
        its use, and to receive a copy. Parents can make these requests for their children. For school records, ask your
        school; for anything else, write to <a href={mail}>{LEGAL.contact}</a>. You may also complain to the National Cyber
        Security Authority (NCSA), Rwanda&apos;s supervisory authority for personal data.
      </p>

      <h2>Cookies</h2>
      <p>{LEGAL.product} uses one cookie, to keep you signed in. See the <Link href="/cookies">cookie policy</Link>.</p>

      <h2>Changes</h2>
      <p>If we change this policy we will update the date above, and tell schools about important changes before they apply.</p>

      <h2>Contact</h2>
      <p>{LEGAL.owner}, {LEGAL.country}. Email: <a href={mail}>{LEGAL.contact}</a></p>
    </>
  );
}

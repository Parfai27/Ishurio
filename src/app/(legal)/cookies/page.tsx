import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Cookie policy", description: "The cookie Ishurio uses and why." };

export default function CookiesPage() {
  return (
    <>
      <h1>Cookie policy</h1>
      <p className="updated">Last updated {LEGAL.updated}</p>

      <p>
        {LEGAL.product} uses as few cookies as possible: one, which keeps you signed in. There are no advertising,
        analytics or tracking cookies, so there is nothing to opt out of and no cookie banner.
      </p>

      <h2>The cookie we set</h2>
      <table>
        <thead><tr><th>Name</th><th>Purpose</th><th>Type</th><th>Lasts</th></tr></thead>
        <tbody>
          <tr>
            <td><code>sms_session</code></td>
            <td>Keeps you signed in and tells the app which role you have. It is only readable by our server, not by scripts in the page.</td>
            <td>Strictly necessary, first party</td>
            <td>7 days, or until you sign out</td>
          </tr>
        </tbody>
      </table>
      <p>It is set only when you sign in. Visiting the public pages without signing in sets no cookie.</p>

      <h2>Other storage</h2>
      <p>
        The public website loads its typeface from Google Fonts, which receives your IP address and browser details to
        deliver the font files. Google does not set cookies for this.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can delete or block cookies in your browser settings. If you block the sign-in cookie you will not be able to
        sign in to {LEGAL.product}; the public pages still work.
      </p>

      <h2>More</h2>
      <p>For how we handle personal data generally, see the <Link href="/privacy">privacy policy</Link>.</p>
    </>
  );
}

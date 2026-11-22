import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Terms of use", description: "The terms for using Ishurio." };

export default function TermsPage() {
  const mail = `mailto:${LEGAL.contact}`;
  return (
    <>
      <h1>Terms of use</h1>
      <p className="updated">Last updated {LEGAL.updated}</p>

      <p>
        These terms apply to everyone who uses {LEGAL.product}, the school management software run by {LEGAL.owner}.
        By signing in or using the website you agree to them. A school using {LEGAL.product} may also have a separate
        written agreement with us; where the two differ, that agreement wins.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>Your school creates your account and decides your role (administrator, teacher, bursar or parent).</li>
        <li>Keep your password private and do not share your account. Tell your school straight away if you think someone else has used it.</li>
        <li>You are responsible for what is done with your account.</li>
      </ul>

      <h2>Using {LEGAL.product}</h2>
      <p>You agree not to:</p>
      <ul>
        <li>look at, copy or change records you have not been given access to;</li>
        <li>enter information you know is false, or upload anything unlawful or harmful;</li>
        <li>send notices or SMS that are abusive, misleading or unrelated to school matters;</li>
        <li>try to break, overload, or get around the security of the service.</li>
      </ul>
      <p>We may suspend an account that breaks these rules, and will tell the school when we do.</p>

      <h2>School data</h2>
      <p>
        Each school owns the records it enters and is responsible for having the right to use them, including
        pupils&apos; data. We process that data only to provide the service, as set out in the{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Fees and payments</h2>
      <p>
        {LEGAL.product} records the fees a school bills and the payments its bursar enters. It does not take, hold or
        transfer money. Receipts it prints show what was recorded; disputes about a payment are between the family and the
        school.
      </p>

      <h2>SMS notices</h2>
      <p>When a school turns on SMS, texts are sent through Africa&apos;s Talking using the school&apos;s own account, and the school pays its SMS costs.</p>

      <h2>Availability and changes</h2>
      <p>
        We work to keep {LEGAL.product} available and accurate, but it is provided &quot;as is&quot;. We may update,
        change or take down features, and will give schools reasonable notice of changes that affect them. Schools should
        keep their own copies of records they must legally retain.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect losses, or for losses caused by information a user
        entered, by a user&apos;s misuse, or by services outside our control. Nothing in these terms limits liability that
        cannot be limited under the law of {LEGAL.country}.
      </p>

      <h2>Ending use</h2>
      <p>A school can stop using {LEGAL.product} at any time and ask for an export of its data. What happens to the data afterwards is described in the privacy policy.</p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of {LEGAL.country}, and disputes go to the competent courts of {LEGAL.country}.</p>

      <h2>Contact</h2>
      <p>{LEGAL.owner}. Email: <a href={mail}>{LEGAL.contact}</a></p>
    </>
  );
}

import { InfoPage } from "@/components/info-page";
import { readDb } from "@/lib/db";

export default async function ContactPage() {
  const db = await readDb();
  return (
    <InfoPage title="Contact">
      <p>{db.settings.storeName}</p>
      <p>{db.settings.address}</p>
      <p>Phone: {db.settings.phoneDisplay}</p>
      <p>Hours: every day, 9:00 AM to 9:00 PM</p>
      <p>Orders are delivered cash on delivery in Rawalpindi and Islamabad. For an existing order, sign in and open My Orders to see its status.</p>
    </InfoPage>
  );
}

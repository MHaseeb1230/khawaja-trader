import { InfoPage } from "@/components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy">
      <p>Khawaja Traders stores the name, phone number, address, and shop name you enter so we can create your account and deliver orders.</p>
      <p>Passwords are stored as a hash. We do not show your password to staff. Order history is visible to you and to the shop admin.</p>
      <p>We use this information to confirm orders, arrange cash-on-delivery, and approve wholesale accounts. We do not sell customer lists.</p>
      <p>To correct your address or phone, contact the shop. You can stop using the account at any time.</p>
    </InfoPage>
  );
}

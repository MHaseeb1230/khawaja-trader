import { InfoPage } from "@/components/info-page";
import { readDb } from "@/lib/db";

export default async function AboutPage() {
  const db = await readDb();
  return (
    <InfoPage title={`About ${db.settings.storeName}`}>
      <p>
        {db.settings.storeName} is a general store and cosmetics shop serving {db.settings.city}. Customers can buy at retail prices, and shopkeepers can request wholesale prices.
      </p>
      <p>
        Browse the catalog, add items to the cart, and sign in to place an order. Delivery is cash on delivery inside Rawalpindi and Islamabad. The charge depends on the area you choose at checkout.
      </p>
      <p>
        Wholesale accounts stay on retail prices until the shop approves them. After approval, the Wholesale switch uses the lower price and any minimum quantity on the product.
      </p>
      <p>Shop hours are every day, 9:00 AM to 9:00 PM.</p>
    </InfoPage>
  );
}

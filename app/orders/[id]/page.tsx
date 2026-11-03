import { ReceiptView } from "@/components/receipt-view";

type Props = { params: Promise<{ id: string }> };

export default async function OrderReceiptPage({ params }: Props) {
  const { id } = await params;
  return <ReceiptView id={id} />;
}

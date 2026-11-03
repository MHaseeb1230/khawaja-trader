import { ProductDetail } from "@/components/product-detail";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

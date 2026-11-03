export type DeliveryArea = {
  id: string;
  city: "Rawalpindi" | "Islamabad";
  name: string;
  charge: number;
};

export const deliveryAreas: DeliveryArea[] = [
  { id: "pindi-saddar", city: "Rawalpindi", name: "Saddar", charge: 150 },
  { id: "pindi-commercial", city: "Rawalpindi", name: "Commercial Market", charge: 150 },
  { id: "pindi-satellite", city: "Rawalpindi", name: "Satellite Town", charge: 200 },
  { id: "pindi-bahria", city: "Rawalpindi", name: "Bahria Town", charge: 250 },
  { id: "pindi-other", city: "Rawalpindi", name: "Other Rawalpindi area", charge: 250 },
  { id: "isb-blue", city: "Islamabad", name: "Blue Area", charge: 200 },
  { id: "isb-f", city: "Islamabad", name: "F sectors", charge: 200 },
  { id: "isb-g", city: "Islamabad", name: "G sectors", charge: 220 },
  { id: "isb-bahria", city: "Islamabad", name: "Bahria / DHA", charge: 300 },
  { id: "isb-other", city: "Islamabad", name: "Other Islamabad area", charge: 300 },
];

export function findArea(id: string) {
  return deliveryAreas.find((area) => area.id === id) ?? null;
}

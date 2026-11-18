import { ServicesAdmin } from "@/components/admin/collections";
import { Guard } from "@/components/admin/Guard";

export const metadata = { title: "الخدمات" };

export default function Page() {
  return (
    <Guard area="content">
      <ServicesAdmin />
    </Guard>
  );
}

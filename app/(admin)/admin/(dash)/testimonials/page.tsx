import { TestimonialsAdmin } from "@/components/admin/collections";
import { Guard } from "@/components/admin/Guard";

export const metadata = { title: "آراء العملاء" };

export default function Page() {
  return (
    <Guard area="content">
      <TestimonialsAdmin />
    </Guard>
  );
}

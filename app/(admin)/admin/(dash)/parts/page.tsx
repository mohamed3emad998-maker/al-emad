import { PartsAdmin } from "@/components/admin/collections";
import { Guard } from "@/components/admin/Guard";

export const metadata = { title: "قطع الغيار" };

export default function Page() {
  return (
    <Guard area="content">
      <PartsAdmin />
    </Guard>
  );
}

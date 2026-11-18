import { GalleryAdmin } from "@/components/admin/collections";
import { Guard } from "@/components/admin/Guard";

export const metadata = { title: "المعرض والفيديو" };

export default function Page() {
  return (
    <Guard area="content">
      <GalleryAdmin />
    </Guard>
  );
}

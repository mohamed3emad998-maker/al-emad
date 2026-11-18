import { StatsAdmin } from "@/components/admin/collections";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Guard } from "@/components/admin/Guard";

export const metadata = { title: "محتوى الصفحات" };

export default function Page() {
  return (
    <Guard area="content">
      <ContentEditor />
      <div className="mt-14">
        <StatsAdmin />
      </div>
    </Guard>
  );
}

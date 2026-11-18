import { Guard } from "@/components/admin/Guard";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "إعدادات الموقع" };

export default function Page() {
  return (
    <Guard area="settings">
      <SettingsForm />
    </Guard>
  );
}

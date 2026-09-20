import { ThemeBuilder } from '../ThemeBuilder';

export default function AdminThemePage() {
  return (
    <ThemeBuilder
      target="admin"
      title="Admin Theme Builder"
      defaultPaths={[
        { label: 'Dashboard', value: '/admin' },
        { label: 'Content', value: '/admin/content' },
        { label: 'Payments', value: '/admin/payments' },
        { label: 'Team', value: '/admin/team' },
      ]}
    />
  );
}

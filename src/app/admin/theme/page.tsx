import { ThemeBuilder } from './ThemeBuilder';

export default function FrontendThemePage() {
  return (
    <ThemeBuilder
      target="frontend"
      title="Website Theme Builder"
      defaultPaths={[
        { label: 'Home', value: '/' },
        { label: 'Pricing', value: '/pricing' },
        { label: 'Blog', value: '/blog' },
        { label: 'About', value: '/about' },
        { label: 'Contact', value: '/contact' },
      ]}
    />
  );
}

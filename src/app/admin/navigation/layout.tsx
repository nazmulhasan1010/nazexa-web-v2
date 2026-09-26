export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-background relative px-6 py-4 h-full">
        {children}
      </div>
    </div>
  );
}

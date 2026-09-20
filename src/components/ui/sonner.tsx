import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:!bg-background group-[.toaster]:!text-foreground group-[.toaster]:!border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-primary',
          description: 'group-[.toast]:!text-muted-foreground',
          actionButton: 'group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:rounded-md',
          cancelButton: 'group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground group-[.toast]:rounded-md',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

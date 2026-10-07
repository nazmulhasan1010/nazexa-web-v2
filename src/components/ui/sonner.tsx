import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:!font-sans [&_[data-icon]]:!mr-4',
          default:
            'group-[.toaster]:!bg-slate-950/80 group-[.toaster]:!border-slate-500/20 group-[.toaster]:shadow-[0_4px_24px_-2px_rgba(100,116,139,0.25)] group-[.toaster]:!text-slate-50 [&_[data-icon]]:bg-gradient-to-br [&_[data-icon]]:from-slate-500/20 [&_[data-icon]]:to-slate-500/0 [&_[data-icon]]:text-slate-400 [&_[data-icon]]:p-1.5 [&_[data-icon]]:rounded-full',
          success:
            'group-[.toaster]:!bg-emerald-950/80 group-[.toaster]:!border-emerald-500/20 group-[.toaster]:shadow-[0_4px_24px_-2px_rgba(16,185,129,0.25)] group-[.toaster]:!text-emerald-50 [&_[data-icon]]:bg-gradient-to-br [&_[data-icon]]:from-emerald-500/20 [&_[data-icon]]:to-emerald-500/0 [&_[data-icon]]:text-emerald-400 [&_[data-icon]]:p-1.5 [&_[data-icon]]:rounded-full',
          error:
            'group-[.toaster]:!bg-rose-950/80 group-[.toaster]:!border-rose-500/20 group-[.toaster]:shadow-[0_4px_24px_-2px_rgba(225,29,72,0.25)] group-[.toaster]:!text-rose-50 [&_[data-icon]]:bg-gradient-to-br [&_[data-icon]]:from-rose-500/20 [&_[data-icon]]:to-rose-500/0 [&_[data-icon]]:text-rose-400 [&_[data-icon]]:p-1.5 [&_[data-icon]]:rounded-full',
          warning:
            'group-[.toaster]:!bg-amber-950/80 group-[.toaster]:!border-amber-500/20 group-[.toaster]:shadow-[0_4px_24px_-2px_rgba(245,158,11,0.25)] group-[.toaster]:!text-amber-50 [&_[data-icon]]:bg-gradient-to-br [&_[data-icon]]:from-amber-500/20 [&_[data-icon]]:to-amber-500/0 [&_[data-icon]]:text-amber-400 [&_[data-icon]]:p-1.5 [&_[data-icon]]:rounded-full',
          info:
            'group-[.toaster]:!bg-blue-950/80 group-[.toaster]:!border-blue-500/20 group-[.toaster]:shadow-[0_4px_24px_-2px_rgba(59,130,246,0.25)] group-[.toaster]:!text-blue-50 [&_[data-icon]]:bg-gradient-to-br [&_[data-icon]]:from-blue-500/20 [&_[data-icon]]:to-blue-500/0 [&_[data-icon]]:text-blue-400 [&_[data-icon]]:p-1.5 [&_[data-icon]]:rounded-full',
          title: 'group-[.toast]:font-semibold group-[.toast]:!text-white',
          description: 'group-[.toast]:opacity-70 group-[.toast]:text-current group-[.toast]:text-sm',
          actionButton:
            'group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:rounded-md',
          cancelButton:
            'group-[.toast]:!bg-slate-800 group-[.toast]:!text-slate-300 group-[.toast]:rounded-md',
          closeButton:
            'group-[.toast]:!bg-slate-800 group-[.toast]:!border-slate-700 group-[.toast]:!text-slate-300 group-[.toast]:hover:!bg-slate-700 group-[.toast]:hover:!text-slate-100 group-[.toast]:transition-colors !left-auto !right-3 !top-0 !bottom-0 !my-auto !h-6 !w-6 !transform-none',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

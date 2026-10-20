/* Toaster Component - A component that displays a toaster (a component that displays a toast) - from shadcn/ui (exposes Toaster) */
import './sonner.css'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#202B28] group-[.toaster]:border-[#E4EAE6] group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-[#66736D]',
          actionButton:
            'group-[.toast]:bg-[#063D30] group-[.toast]:text-white group-[.toast]:font-semibold',
          cancelButton: 'group-[.toast]:bg-[#F1F4F2] group-[.toast]:text-[#66736D]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

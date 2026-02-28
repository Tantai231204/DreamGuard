import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-[#4988c4] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
          success: "group-[.toast]:border-green-500 group-[.toast]:text-green-700",
          error: "group-[.toast]:border-red-500 group-[.toast]:text-red-700",
          warning: "group-[.toast]:border-amber-500 group-[.toast]:text-amber-700",
          info: "group-[.toast]:border-blue-500 group-[.toast]:text-blue-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

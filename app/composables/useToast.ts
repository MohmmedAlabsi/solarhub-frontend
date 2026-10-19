export const useToast = () => {
  const { notify } = useAdminNotice()

  return {
    success: (message: string) => notify(message),
    error: (message: string) => notify(message),
    info: (message: string) => notify(message),
  }
}

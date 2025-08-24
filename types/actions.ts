export type actionFunction = (
  prevState: unknown,
  formData: FormData
) => Promise<{ message: string, redirectTo?: string }>;


export type errorMessage = {
    message: string;
};
export const runWithLoading = async (
  operation: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  onError: (error: unknown) => void,
) => {
  setLoading(true);
  try {
    await operation();
    return true;
  } catch (error) {
    onError(error);
    return false;
  } finally {
    setLoading(false);
  }
};

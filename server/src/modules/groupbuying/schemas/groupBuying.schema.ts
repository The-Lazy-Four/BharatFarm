export const groupBuyingSchema = {
  validate: (body: any) => {
    const quantity = Number(body?.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: { message: 'quantity must be a positive number' } };
    }
    return { error: null };
  }
};

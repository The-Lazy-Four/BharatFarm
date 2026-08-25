export const krishiBotSchema = {
  validate: (body: any) => {
    if (!body || typeof body.message !== 'string' || body.message.trim() === '') {
      return { error: { message: 'Message text is required' } };
    }
    return { error: null };
  }
};

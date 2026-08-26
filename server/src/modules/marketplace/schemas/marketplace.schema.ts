const VALID_CATEGORIES = ['crops', 'seeds', 'fertilizers', 'equipment'];

export const marketplaceSchema = {
  validate: (body: any) => {
    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return { error: { message: 'title is required' } };
    }
    if (typeof body.price !== 'number' || body.price <= 0) {
      return { error: { message: 'price must be a positive number' } };
    }
    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return { error: { message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` } };
    }
    if (!body.unit || typeof body.unit !== 'string') {
      return { error: { message: 'unit is required' } };
    }
    if (typeof body.quantityAvailable !== 'number' || body.quantityAvailable < 0) {
      return { error: { message: 'quantityAvailable must be a non-negative number' } };
    }
    if (!body.location || typeof body.location !== 'string') {
      return { error: { message: 'location is required' } };
    }
    if (!body.sellerPhone || typeof body.sellerPhone !== 'string' || !body.sellerPhone.trim()) {
      return { error: { message: 'mobile number is required' } };
    }
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(body.sellerPhone.replace(/\s/g, ''))) {
      return { error: { message: 'sellerPhone must be a valid 10 digit Indian mobile number' } };
    }
    return { error: null };
  }
};

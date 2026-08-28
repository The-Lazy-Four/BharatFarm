export const groupBuyingSchema = {
  validate: (body: any) => {
    const quantity = Number(body?.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: { message: 'quantity must be a positive number' } };
    }
    return { error: null };
  }
};

export const createPoolSchema = {
  validate: (body: any) => {
    if (!body?.itemTitle || typeof body.itemTitle !== 'string' || body.itemTitle.trim().length === 0) {
      return { error: { message: 'itemTitle is required' } };
    }
    const validCategories = ['fertilizer', 'seeds', 'machinery'];
    if (!body?.category || !validCategories.includes(body.category)) {
      return { error: { message: `category must be one of ${validCategories.join(', ')}` } };
    }
    const originalPrice = Number(body?.originalPricePerUnit);
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      return { error: { message: 'originalPricePerUnit must be a positive number' } };
    }
    const discountedPrice = Number(body?.discountedPricePerUnit);
    if (!Number.isFinite(discountedPrice) || discountedPrice <= 0) {
      return { error: { message: 'discountedPricePerUnit must be a positive number' } };
    }
    const targetQty = Number(body?.targetQuantity);
    if (!Number.isFinite(targetQty) || targetQty <= 0) {
      return { error: { message: 'targetQuantity must be a positive integer' } };
    }
    if (!body?.deadline || isNaN(Date.parse(body.deadline))) {
      return { error: { message: 'deadline must be a valid ISO date string' } };
    }
    if (new Date(body.deadline).getTime() <= Date.now()) {
      return { error: { message: 'deadline must be in the future' } };
    }
    if (!body?.location || typeof body.location !== 'string' || body.location.trim().length === 0) {
      return { error: { message: 'location is required' } };
    }
    return { error: null };
  }
};

export const weatherSchema = {
  validate: (query: any) => {
    if (query?.lat !== undefined && Number.isNaN(Number(query.lat))) {
      return { error: { message: 'lat must be a number' } };
    }
    if (query?.lon !== undefined && Number.isNaN(Number(query.lon))) {
      return { error: { message: 'lon must be a number' } };
    }
    return { error: null };
  }
};

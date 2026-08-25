export const schemesSchema = {
  validate: (body: any) => {
    if (!body) return { error: { message: 'Request body is required' } };

    if (body.state !== undefined && (!body.state || typeof body.state !== 'string')) {
      return { error: { message: 'state must be a non-empty string' } };
    }

    if (body.landSizeAcres === undefined || Number.isNaN(Number(body.landSizeAcres)) || Number(body.landSizeAcres) < 0) {
      return { error: { message: 'landSizeAcres must be a non-negative number' } };
    }

    if (body.annualIncome !== undefined && (Number.isNaN(Number(body.annualIncome)) || Number(body.annualIncome) < 0)) {
      return { error: { message: 'annualIncome must be a non-negative number' } };
    }

    return { error: null };
  }
};

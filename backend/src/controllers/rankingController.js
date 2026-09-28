import { HttpError, asyncHandler } from '../utils/httpError.js';
import { computeRanking } from '../services/rankingService.js';

export const getRanking = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!['daily', 'weekly', 'monthly'].includes(type)) {
    throw new HttpError(400, 'Tipo de ranking inválido (daily | weekly | monthly)');
  }
  res.json(await computeRanking(type));
});

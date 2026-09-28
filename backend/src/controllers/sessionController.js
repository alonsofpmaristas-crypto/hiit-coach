import { asyncHandler } from '../utils/httpError.js';
import { getOrCreateSessionForDate, withExercises } from '../services/sessionService.js';

export const getToday = asyncHandler(async (_req, res) => {
  const session = await getOrCreateSessionForDate();
  res.json(await withExercises(session));
});

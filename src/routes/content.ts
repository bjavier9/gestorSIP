import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { handleSuccess } from '../utils/responseHandler';
import ApiError from '../utils/ApiError';
import { refinePrompt } from '../services/contentService';
import { isValidLanguageCode, LanguageCode } from '../utils/supportedLanguages';

const router = Router();

/**
 * @swagger
 * /api/content/refine-prompt:
 *   post:
 *     summary: Refines a user-provided prompt with additional instructions.
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - languageCode
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The initial prompt to be refined.
 *                 example: "Write a blog post about the future of AI."
 *               languageCode:
 *                 type: string
 *                 description: The ISO code for the target language.
 *                 example: "en-GB"
 *               additionalInstructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of extra instructions for the refinement.
 *                 example: ["Make it sound optimistic.", "Target audience: tech enthusiasts."]
 *     responses:
 *       200:
 *         description: Successfully refined the prompt.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad Request (e.g., missing fields, invalid language code).
 *       401:
 *         description: Unauthorized.
 */
router.post('/refine-prompt', asyncHandler(async (req, res, next) => {
  const { prompt, languageCode, additionalInstructions } = req.body;

  // 1. Validate input
  if (!prompt || !languageCode) {
    throw new ApiError('VALIDATION_MISSING_FIELDS', 'The '+prompt+' and '+languageCode+' fields are required.');
  }

 
  if (!isValidLanguageCode(languageCode)) {
    throw new ApiError('VALIDATION_INVALID_EMAIL', `Invalid 'languageCode'. Please use one of the supported language codes.`);
  }

  // 2. Call the service layer
  const refinedData = refinePrompt({
    prompt,
    languageCode: languageCode as LanguageCode,
    additionalInstructions,
  });

  // 3. Send the successful response
  handleSuccess(res, refinedData);
}));

export default router;

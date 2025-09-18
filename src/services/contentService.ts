import { supportedLanguages, LanguageCode } from '../utils/supportedLanguages';

interface RefinePromptArgs {
  prompt: string;
  languageCode: LanguageCode;
  additionalInstructions?: string[];
}

interface RefinedPrompt {
  refinedPrompt: string;
  language: string;
  languageCode: LanguageCode;
  originalPrompt: string;
  instructions: string[];
}

/**
 * Combines an initial prompt with structured instructions to generate a refined prompt.
 */
export const refinePrompt = ({
  prompt,
  languageCode,
  additionalInstructions = [],
}: RefinePromptArgs): RefinedPrompt => {
  
  const language = supportedLanguages[languageCode];

  // Base instructions for the AI model
  const baseInstructions = [
    `1. Role: You are an expert copywriter and prompt engineer.`,
    `2. Task: Refine the following user-provided prompt.`,
    `3. Goal: Enhance the prompt for clarity, engagement, and effectiveness, tailored for a specific audience.`,
    `4. Output Language: The final refined prompt MUST be in ${language} (${languageCode}).`,
    `5. Key Information: The user's original prompt is: "${prompt}"`,    
  ];

  // Add any extra instructions provided by the user
  const allInstructions = [...baseInstructions, ...additionalInstructions];

  // Combine all parts into a single, detailed prompt for the AI
  const finalPrompt = [
    "---",
    "**PROMPT REFINEMENT INSTRUCTIONS**",
    ...allInstructions,
    "---",
    "Based on all the instructions above, generate the refined prompt now.",
  ].join('\n');

  return {
    refinedPrompt: finalPrompt,
    language,
    languageCode,
    originalPrompt: prompt,
    instructions: allInstructions,
  };
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// Initialize the Google Generative AI client
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GEMINI_API_KEY is missing in the environment variables.");
    }
    return new GoogleGenerativeAI(apiKey);
};

export const generateCodeCompletion = asyncHandler(async (req, res) => {
    const { prefix, suffix, language } = req.body;

    if (!prefix) {
        throw new ApiError(400, "Prefix is required for code completion.");
    }

    const genAI = getGenAI();
    // Using flash because it's optimized for speed
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert AI code completion engine. Your task is to provide the next logical lines of code to complete the user's snippet.
Do NOT repeat the prefix. Do NOT wrap the code in markdown blocks like \`\`\`. Just output the raw code completion exactly as it should be inserted at the cursor position.

Language: ${language || "javascript"}

# Prefix (Before Cursor):
${prefix}

# Suffix (After Cursor):
${suffix || ""}

# Instruction: Provide only the exact characters to complete the prefix seamlessly. Do not provide explanations.
`;

    try {
        const result = await model.generateContent(prompt);
        let completion = result.response.text();
        
        // Strip markdown backticks if the model accidentally included them
        completion = completion.replace(/^```[a-z]*\n/i, '');
        completion = completion.replace(/```$/i, '');
        // Trim some leading/trailing whitespace if it starts cleanly
        if (completion.startsWith('\n')) completion = completion.slice(1);
        
        return res.status(200).json(new ApiResponse(200, { completion }, "Code completion generated"));
    } catch (error) {
        console.error("AI Completion Error:", error);
        throw new ApiError(500, "Failed to generate code completion: " + error.message);
    }
});

export const generateCodeSuggestion = asyncHandler(async (req, res) => {
    const { code, prompt: userPrompt, language } = req.body;

    if (!code || !userPrompt) {
        throw new ApiError(400, "Both 'code' and 'prompt' are required.");
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert AI pair programmer.
The user has selected the following ${language || 'code'} snippet and asked you to modify it.

# Selected Code:
\`\`\`${language || ''}
${code}
\`\`\`

# User Request:
${userPrompt}

# Instruction: Provide the completely modified code. Do NOT provide explanations. ONLY output the raw code block.
`;

    try {
        const result = await model.generateContent(prompt);
        let suggestion = result.response.text();

        // Strip markdown backticks
        suggestion = suggestion.replace(/^```[a-z]*\n/i, '');
        suggestion = suggestion.replace(/\n```$/i, '');

        return res.status(200).json(new ApiResponse(200, { suggestion }, "Code suggestion generated"));
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        throw new ApiError(500, "Failed to generate code suggestion: " + error.message);
    }
});

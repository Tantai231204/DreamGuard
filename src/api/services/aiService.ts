import api from "@/lib/api";

export interface FAQMatch {
    faq_id: string;
    question: string;
    answer: string;
    category: string;
    confidence: number;
}

export interface AIProduct {
    ProductId: string;
    ProductName: string;
    Slug: string;
    Summary: string;
    SalePrice: number;
    BasePrice: number;
    AgeGroup: number;
    CategoryName: string;
    ImageUrl?: string;
}

export interface AIFAQResponse {
    question: string;
    answer: string;
    category: string;
    faq_matches: FAQMatch[];
    recommended_products: AIProduct[];
    follow_up_suggestions: string[];
}

const aiService = {
    /**
     * Ask the AI advisor a question
     * @param question The user's question
     */
    askFAQ: async (question: string): Promise<AIFAQResponse> => {
        const response = await api.post<AIFAQResponse>("/ai/faq", { question });
        return response.data;
    }
};

export default aiService;

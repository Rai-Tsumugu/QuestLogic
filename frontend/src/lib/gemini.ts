// Define the result type (matching Backend response)
export interface AnalysisResult {
    summary: string;
    score_breakdown: {
        volume: number;
        process: number;
        carefulness: number;
        review: number;
    };
    total_score: number;
    features: Array<{
        type: string;
        location: string;
        description: string;
    }>;
    suspicion_flag: boolean;
    suspicion_reason: string | null;
    feedback_to_child: string;
    feedback_to_parent: string;
}

export async function analyzeHomework(
    beforeImage: File,
    afterImage: File,
    metadata = { subject: '算数', topic: '計算', parent_focus: '途中式' }
): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('beforeImage', beforeImage);
    formData.append('afterImage', afterImage);
    formData.append('metadata', JSON.stringify(metadata));

    try {
        // Call the local backend API
        // In production, this URL should be an environment variable
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return result as AnalysisResult;

    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
}

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
    try {
        console.log("Request body:", event.body);

        if (!event.body) {
            console.error("Error: Request body is empty.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "リクエストボディが空です。" }),
            };
        }

        let body;
        try {
            body = JSON.parse(event.body);
            console.log("Parsed body:", body);
        } catch (error) {
            console.error("Error: Invalid JSON format", error);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "無効なJSONフォーマットです。" }),
            };
        }

        const userQuestion = body.message;

        if (!userQuestion) {
            console.error("Error: No question provided.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "質問が送信されていません。" }),
            };
        }

        console.log("Sending request to OpenAI with message:", userQuestion);

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // 最新のChatモデル
            messages: [
                { role: "system", content: "あなたは親切で優しいお医者さんです。" },
                { role: "user", content: userQuestion },
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        console.log("OpenAI response:", completion.data);

        const answer = completion.data.choices[0].message.content.trim();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // CORS対応（必要なら）
            },
            body: JSON.stringify({ answer }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "サーバーエラーが発生しました。" }),
        };
    }
};

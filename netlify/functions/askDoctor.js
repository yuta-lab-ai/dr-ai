const { Configuration, OpenAIApi } = require("openai");

// OpenAIのAPIキーを設定（Netlifyの環境変数から取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // ここで環境変数からAPIキーを取得
});
const openai = new OpenAIApi(configuration);

// サーバーレス関数のエントリーポイント
exports.handler = async (event, context) => {
  try {
    // リクエストボディの内容をロギング
    console.log("Request body:", event.body);
    
    // POSTリクエストで送られたデータを取得
    if (!event.body) {
      console.error("Error: Request body is empty.");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "リクエストボディが空です。" }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body); // JSONパースの処理
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

    // OpenAIのAPIを呼び出して質問に対する回答を生成
    console.log("Sending request to OpenAI with prompt:", userQuestion);
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: userQuestion,
      max_tokens: 150,
      temperature: 0.7,
    });

    console.log("OpenAI response:", completion.data);

    const answer = completion.data.choices[0].text.trim();

    // 回答をクライアントに返す
    return {
      statusCode: 200,
      body: JSON.stringify({ answer: answer }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "サーバーエラーが発生しました。" }),
    };
  }
};

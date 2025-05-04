const { Configuration, OpenAIApi } = require("openai");

// OpenAIのAPIキーを設定（Netlifyの環境変数から取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // ここで環境変数からAPIキーを取得
});
const openai = new OpenAIApi(configuration);

// サーバーレス関数のエントリーポイント
exports.handler = async (event, context) => {
  try {
    // POSTリクエストで送られたデータを取得
    const body = JSON.parse(event.body);
    const userQuestion = body.question;

    if (!userQuestion) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "質問が送信されていません。" }),
      };
    }

    // OpenAIのAPIを呼び出して質問に対する回答を生成
    const completion = await openai.createCompletion({
      model: "text-davinci-003",  // GPT-3モデル
      prompt: userQuestion,
      max_tokens: 150,
      temperature: 0.7,
    });

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

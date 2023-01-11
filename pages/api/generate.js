import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateAction = async (req, res) => {
  console.log(`API: ${req.body.basePromptPrefix}${req.body.userInput}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${req.body.basePromptPrefix}${req.body.userInput}`,
    temperature: 0.8,
    max_tokens: req.body.tokens,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();
  console.log('basePromptOutput.text:', basePromptOutput.text);
  
  res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
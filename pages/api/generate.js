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
  
  // // I call the OpenAI API a second time with Prompt #2
  // const secondPromptCompletion = await openai.createCompletion({
  //   model: 'text-davinci-003',
  //   prompt: `${secondPrompt}`,
  //   // I set a higher temperature for this one. Up to you!
  //   temperature: 0.85,
  //   max_tokens: 550, // MAAAAAAAAAAAAKE THIS HIGHERRRRRRRRRRRRRRRR!!!!!!!!!!!!!!!!!!!!! AROUND 1500
  // });
  
  // // Get the output
  // const secondPromptOutput = secondPromptCompletion.data.choices.pop();

  // // Send over the Prompt #2's output to our UI instead of Prompt #1's.
  res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
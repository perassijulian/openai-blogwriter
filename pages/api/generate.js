import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix =
`
A blog post should be well-written, informative, and engaging. Here are a few tips for crafting a strong blog post:
Use descriptive adjectives and nouns to bring your topic to life and help the reader visualize and understand what you are writing about.
Organize your post into clear sections or headings, and use subheadings to break up the text and make it easier to read.
Use examples and anecdotes to illustrate your points and make them more relatable to the reader.
Overall, the goal of a blog post is to provide value to the reader and engage them with interesting and informative content.
I want to write a blogpost. Write me 4 subheadings separated by commas. 
The topic of the blogpost is:
`

const generateAction = async (req, res) => {
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${req.body.userInput}`,
    temperature: 0.8,
    max_tokens: 250,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();
  console.log('basePromptOutput.text:', basePromptOutput.text);

  // I build Prompt #2.
  const secondPrompt = 
  `
  Bullet points can be a useful tool for organizing and presenting information in a clear and concise way. Here are a few tips for crafting strong bullet points:
  Keep each bullet point short and to-the-point. A good rule of thumb is to keep each bullet point to one or two short sentences.
  Use parallel structure within each bullet point. This means that each bullet point should have the same grammatical structure (e.g., all should be phrases, or all should be complete sentences).
  Use bullet points to list items that are related and can be read independently from one another. If the items in your list are not related or do not make sense on their own, consider using a different formatting tool, such as a numbered list or a paragraph.
  Use bullet points to highlight key points or takeaways. Bullet points can help draw the reader's attention to the most important points in your content.
  Avoid using too many bullet points in one section. If you have a lot of information to present, consider using subheadings to break up the content and make it easier to read.
  
  Take the title, the table of subheadings and generate bulletpoints of each one. The answer should be formatted as a JSON. The key will be 'data' and the value will be an array of JSON. The lenght of the array will be the amount of subheaders.
  Each value on the array will be a JSON. This JSON will have 'subheading' and 'bulletpoints' as keys. The value for 'subheading' is the string that defines it and the value for 'bulletpoints' will be an array that cointains them. For JSON use this quotation marks (").   

  Title: ${req.body.userInput}

  Table of subheadings: ${basePromptOutput.text}

  Answer:
  `
  
  // I call the OpenAI API a second time with Prompt #2
  const secondPromptCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${secondPrompt}`,
    // I set a higher temperature for this one. Up to you!
    temperature: 0.85,
    max_tokens: 550, // MAAAAAAAAAAAAKE THIS HIGHERRRRRRRRRRRRRRRR!!!!!!!!!!!!!!!!!!!!! AROUND 1500
  });
  
  // Get the output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();

  // Send over the Prompt #2's output to our UI instead of Prompt #1's.
  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;
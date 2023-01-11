import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

const Home = () => {
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState([]);
  const [blogSelection, setBlogSelection] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogFinished, setBlogFinished] = useState("");

  const getSubheadings = async () => {
    const basePromptPrefix = `
    A blog post should be well-written, informative, and engaging. Here are a few tips for crafting a strong blog post:
    Use descriptive adjectives and nouns to bring your topic to life and help the reader visualize and understand what you are writing about.
    Organize your post into clear sections or headings, and use subheadings to break up the text and make it easier to read.
    Use examples and anecdotes to illustrate your points and make them more relatable to the reader.
    Overall, the goal of a blog post is to provide value to the reader and engage them with interesting and informative content.
    I want to write a blogpost. Write me 4 subheadings separated by commas. 
    The topic of the blogpost is:
    `;

    const tokens = 250;

    const res = await callGenerateEndpoint(basePromptPrefix, tokens);
    return res;
  };

  const getBulletPoints = async () => {
    const subheadings = await getSubheadings();
    const basePromptPrefix = `
    Bullet points can be a useful tool for organizing and presenting information in a clear and concise way. Here are a few tips for crafting strong bullet points:
    Keep each bullet point short and to-the-point. A good rule of thumb is to keep each bullet point to one or two short sentences.
    Use parallel structure within each bullet point. This means that each bullet point should have the same grammatical structure (e.g., all should be phrases, or all should be complete sentences).
    Use bullet points to list items that are related and can be read independently from one another. If the items in your list are not related or do not make sense on their own, consider using a different formatting tool, such as a numbered list or a paragraph.
    Use bullet points to highlight key points or takeaways. Bullet points can help draw the reader's attention to the most important points in your content.
    Avoid using too many bullet points in one section. If you have a lot of information to present, consider using subheadings to break up the content and make it easier to read.
    
    Take the title, the table of subheadings and generate bulletpoints of each one. The answer should be formatted as a JSON. The key will be 'data' and the value will be an array of JSON. The lenght of the array will be the amount of subheaders.
    Each value on the array will be a JSON. This JSON will have 'subheading' and 'bulletpoints' as keys. The value for 'subheading' is the string that defines it and the value for 'bulletpoints' will be an array that cointains them. For JSON use this quotation marks (").   

    Title: ${userInput}

    Table of subheadings: ${subheadings}

    Answer:
    `;

    const tokens = 400;

    const res = await callGenerateEndpoint(basePromptPrefix, tokens);

    const trimed = res.trim();
    const blogObject = JSON.parse(trimed);
    const blogArray = blogObject["data"];

    setApiOutput(blogArray);
    const updatedArray = blogArray.map((item) => {
      const checked = new Array(item.bulletpoints.length).fill(true);
      return { ...item, checked };
    });
    setBlogSelection(updatedArray);
    setIsGenerating(false);
  };

  const callGenerateEndpoint = async (basePromptPrefix, tokens) => {
    setIsGenerating(true);

    console.log("Calling OpenAI...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput, basePromptPrefix, tokens }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    return output.text;
  };

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  function handleCheckboxChange(event, subheading, index) {
    const checked = event.target.checked;
    const bulletpoint = event.target.value;
    const updatedArray = blogSelection.map((item) => {
      if (item.subheading === subheading) {
        if (checked) {
          item.checked[index] = true;
        } else {
          item.checked[index] = false;
        }
      }
      return item;
    });
    setBlogSelection(updatedArray);
  }

  const writeBlog = () => {
    console.log("blogSelection:", blogSelection);
  };

  const callGenerateBlog = async () => {
    const basePromptPrefix = createString();
    console.log("basePromptPrefix:", basePromptPrefix);
    const tokens = 2000;

    const res = await callGenerateEndpoint(basePromptPrefix, tokens);
    setApiOutput([]);
    setBlogFinished(res);
    setIsGenerating(false);
  };

  function createString() {
    let output = `A blog post should be well-written, informative, and engaging. Here are a few tips for crafting a strong blog post:
    Use descriptive adjectives and nouns to bring your topic to life and help the reader visualize and understand what you are writing about.
    Use examples and anecdotes to illustrate your points and make them more relatable to the reader.
    Overall, the goal of a blog post is to provide value to the reader and engage them with interesting and informative content.
    Write me a blog that has`;

    for (let i = 0; i < blogSelection.length; i++) {
      const subheading = blogSelection[i].subheading;
      for (let j = 0; j < blogSelection[i].bulletpoints.length; j++) {
        if (!blogSelection[i].checked[j]) {
          blogSelection[i].bulletpoints.splice(j, 1);
        }
      }
      const bulletpoints = blogSelection[i].bulletpoints.join(", ");
      if (i === 0) {
        output += ` '${subheading}' subheading and its bulletpoints are ${bulletpoints}.`;
      } else {
        output += ` The ${
          i + 1
        }th subheading is '${subheading}' and its bulletpoints are ${bulletpoints}.`;
      }
    }
    return output;
  }

  return (
    <div className="flex flex-col absolute top-0 left-0 w-full h-full p-3 pb-16 bg-green-200">
      <Head>
        <title>GPT-3 Writer | buildspace</title>
      </Head>
      <div className="flex flex-col w-full">
        <div className="flex gap-2 w-full justify-around">
          <input
            placeholder="Insert title or topic"
            className="w-full px-2 border-2 border-green-800 rounded-md"
            value={userInput}
            onChange={onUserChangedText}
            type="text"
          />
          <div className="bg-green-800 text-white w-20 px-2 py-1 cursor-pointer rounded-md">
            <a
              className={
                isGenerating ? "generate-button loading" : "generate-button"
              }
              onClick={getBulletPoints}
            >
              <div className="generate">
                {isGenerating ? <p>Thinking..</p> : <p>Generate</p>}
              </div>
            </a>
          </div>
        </div>
        <div>
          {apiOutput.length > 0 && (
            <div className="flex flex-col items-center">
              {apiOutput.map((item, i) => (
                <div className="mt-2" key={i}>
                  <h3 className="py-1 text-lg font-bold">{item.subheading}</h3>
                  {item.bulletpoints.map((bulletpoint, j) => (
                    <label key={j}>
                      <input
                        className="mx-1"
                        type="checkbox"
                        value={bulletpoint}
                        checked={blogSelection[i].checked[j]}
                        onChange={(event) =>
                          handleCheckboxChange(event, item.subheading, j)
                        }
                      />
                      {bulletpoint}
                      <br />
                    </label>
                  ))}
                </div>
              ))}
              <div
                className="fixed bottom-0 right-0 left-0 flex justify-center items-center pb-4"
                onClick={callGenerateBlog}
              >
                <button
                  className="bg-green-800 font-bold text-white text-center p-2 w-5/6 rounded-md"
                  onClick={callGenerateBlog}
                >
                  WRITE BLOG
                </button>
              </div>
            </div>
          )}
        </div>
        {blogFinished && <p className="mt-3">{blogFinished}</p>}
      </div>
    </div>
  );
};

export default Home;

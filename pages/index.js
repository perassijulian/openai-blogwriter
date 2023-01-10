import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

const Home = () => {
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState([]);
  const [blogSelection, setBlogSelection] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const callGenerateBlog = async () => {
    setIsGenerating(true);

    console.log("Calling OpenAI...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    const trimed = output.text.trim();
    const blogObject = JSON.parse(trimed);
    const blogArray = blogObject["data"];

    setApiOutput(blogArray);
    const updatedArray = blogArray.map((item) => {
      const checked = new Array(item.bulletpoints.length).fill(true);
      return {...item, checked}
    });
    setBlogSelection(updatedArray);
    setIsGenerating(false);
  };
  const callGenerateEndpoint = async () => {
    setIsGenerating(true);

    console.log("Calling OpenAI...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    const trimed = output.text.trim();
    const blogObject = JSON.parse(trimed);
    const blogArray = blogObject["data"];

    setApiOutput(blogArray);
    const updatedArray = blogArray.map((item) => {
      const checked = new Array(item.bulletpoints.length).fill(true);
      return {...item, checked}
    });
    setBlogSelection(updatedArray);
    setIsGenerating(false);
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
          // item.bulletpoints.splice(index, 0, bulletpoint);
          item.checked[index] = true;
        } else {
          // item.bulletpoints.splice(index, 1);
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

  function createString() {
    let output = "Write me a blog that has";
    for (let i = 0; i < blogSelection.length; i++) {
      const subheading = blogSelection[i].subheading;
      for (let j = 0; j < blogSelection[i].bulletpoints.length; j++) {
        if (!(blogSelection[i].checked[j])) {
          blogSelection[i].bulletpoints.splice(j,1)
        }
      }
      const bulletpoints = blogSelection[i].bulletpoints.join(", ");
      if (i === 0) {
        output += ` '${subheading}' subheading and its bulletpoints are ${bulletpoints}.`;
      } else {
        output += ` The ${i+1}th subheading is '${subheading}' and its bulletpoints are ${bulletpoints}.`;
      }
    }
    console.log('output:', output);
  }

  return (
    <div className="flex flex-col w-full p-3 bg-red-300">
      <Head>
        <title>GPT-3 Writer | buildspace</title>
      </Head>
      <div className="flex flex-col w-full">
        <div className="flex gap-2 w-full justify-around">
          <input
            placeholder="Insert title or topic"
            className="w-full"
            value={userInput}
            onChange={onUserChangedText}
            type="text"
          />
          <div className="bg-green-300 w-20 px-2 py-1 cursor-pointer">
            <a
              className={
                isGenerating ? "generate-button loading" : "generate-button"
              }
              onClick={callGenerateEndpoint}
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
                  <h3 className="py-1 text-lg">{item.subheading}</h3>
                  {item.bulletpoints.map((bulletpoint, j) => (
                    <label key={j}>
                      <input
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
                className="bg-green-800 w-5/6 text-white text-center p-2"
                onClick={createString}
              >
                WRITE BLOG
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

# PROMPTS.md

This file contains the prompts used for Codex with GPT-5.5 (Medium). An `AGENTS.md` file was added that simply points to the `README.md`.

> create the base frontend UI for the ai code review application. the ui should be clean, simple and user-friendly. the state of the application is stored in a react context, which will have an object with the review results, later to be displayed by the ui. the ui should have a large text area for users to paste their code and a button to submit and generate a review. a side panel on the right has tree subviews: review, chat, and history, which we will later implement. on the left, another side panel will manage the review sessions for the user, allowing them to jump between different reviews, each with its own context. also add a button to switch between light and dark theme with nice icons, and state stored in local storage. the app should be responsive and work well on mobile devices. use scss for styling. for the implementation, split the code into multiple folders (types, components, contexts, hooks, styles) and keep the code clean and well organized. follow the best practices for react development.

> besides number of chars, add line count and cursor position. add library that auto detects language and applies syntax highlighting to code. the textarea header should display the language. add copy to clipboard button. 

> actually remove number of chars and put the cursor position in the footer where the generate review button is, and move it to the review side panel.

> remove number of lines and add line numbers on the left of the textarea

> add a loading state to the generate review button and disable it and the textarea while the review is being generated, also add a cancel button which is visible while loading. add a timeout of 10 seconds to the review generation, after which it will automatically cancel and show a message to the user. also handle the case where the user manually cancels the review generation and show a message in that case as well.

> implement the review side panel. it should display the review results in a clear and actionable way. for now add hardcoded examples to later be removed. this view displays at the top the total number of issues or suggestions, overall rating and summary of issues and suggestions for improvement, which can be copy pasted into a coding agent. then, the list of issues or suggestions, where each one (correctness, security, performance, etc.) has a corresponding color and category with the number of issues found for each one, and when clicked, the side panel should filter the results to only show the issues for that type. also add a level of confidence to each one, since the LLM may be uncertain. then, below, the side panel displays the list of issues, with their type, severity level, and explanation, and when clicked, the page should scroll to the position in the source code where the issue is located and highlight it. it also has additional actions such as copying it to the clipboard or dismissing it. also add a severity and confidence filter.

> make it so the page never overflows. the review side panel should be scrollable.

> the labels should be: correctness, security, performance, maintability, style, documentation, and other. the severity and confidence levels should be: low, medium and high.

> fix this: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.

> the line highlighting is slightly offset vertically, it needs to match the position exactly with the line. fix it.

> implement the cloudflare workers logic that receives the code from the frontend, sends it to the LLM for analysis and returns the structured feedback to the frontend. make sure the model follows the instructions and returns the exact json we are expecting. keep the code clean and well organized. follow the best practices for cloudflare workers development. reuse the types already implemented and only add more if needed.

> move the api call logic from ReviewContext to a separate file in src/services

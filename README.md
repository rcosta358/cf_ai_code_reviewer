# AI Code Reviewer

Lightweight AI-powered code review application that uses Llama 3.3 to analyze code snippets and provide structured feedback in a single interaction, like Grammarly but for code. Its goal is to provide a simple and developer-friendly way for developers to quickly get feedback on their code, focused on usability and actionable feedback. Reviews are primarily one-shot without requiring any conversational interaction, though optional follow-up interaction is possible, where the LLM can then make changes to their suggestions based on the users feedback.

## Features

- One-shot code review with structured feedback
- Covers multiple aspects of code quality (correctness, security, maintability, performance, etc.)
- Each issue is annotated with a specific explanation and severity level, highlighting the position in the source code where the problem is located
- Overall rating and summary of issues and suggestions for improvement, which can be copy pasted into a coding agent
- Maintains review history and caches results for identical inputs

## Workflow

1. User pastes code into the editor and clicks the review button
2. Backend checks for cached result
3. If not cached, the backend sends the code to the LLM for analysis, with a predefined prompt that instructs how the LLM should analyze the code and how it should structure the response (JSON) 
4. LLM returns structured feedback
5. Backend stores the result in cache and updates the user's review history
6. Frontend displays the feedback to the user in a clear and actionable way

## Architecture

This project is built using the Cloudflare ecosystem:
- **Frontend** (Cloudflare Pages) - simple UI for users to paste code and see reviews
- **Backend** (Cloudflare Workers) - handles requests and interacts with the LLM
- **LLM** (Workers AI, Llama 3.3) - performs code analysis and generates feedback
- **Data Storage** (Cloudflare KV) - stores review history and cached results
- **Session Storage** (Local Storage) - saves user sessions and preferences

## References

- https://agents.cloudflare.com
- https://workers.cloudflare.com
- https://pages.cloudflare.com
- https://developers.cloudflare.com/workers-ai
- https://developers.cloudflare.com/kv
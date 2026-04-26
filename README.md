<div align="center">

# AI Code Reviewer

**Lightweight AI code review application that analyzes code snippets and provides actionable feedback using Cloudflare Workers AI**

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![LLM](https://img.shields.io/badge/Model-Llama%203.3-blue)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## Features

- Code review with structured feedback
- Covers multiple aspects of code quality (correctness, security, maintability, performance, etc.)
- Each issue is annotated with a explanation, suggestion, severity, and confidence level, and with the position in the source code
- Overall rating and summary of the review
- Follow-up chat to ask for clarifications or further suggestions
- Stores past reviews, review history and caches results for identical inputs

## Workflow

1. User pastes code into the editor and clicks the review button
2. Backend checks for cached result
3. If not cached, the backend sends the code to the LLM for analysis, with a predefined prompt that instructs how the LLM should analyze the code and how it should structure the response (JSON) 
4. LLM returns structured feedback
5. Backend stores the result in cache and updates the user's review history
6. Frontend displays the feedback to the user in a clear and actionable way

## Architecture

This project is was built with React+Vite in TypeScript and deployed as a Cloudflare Worker:
- **Frontend** (Worker Static Assets) - user interface to paste code and see reviews
- **Backend** (Cloudflare Workers) - handles requests and interacts with the LLM
- **LLM** (Workers AI, Llama 3.3) - performs code analysis and generates feedback
- **Data Storage** (Cloudflare KV) - stores review history and cached results
- **Session Storage** (Local Storage) - saves user sessions and preferences

## References

- https://agents.cloudflare.com
- https://workers.cloudflare.com
- https://developers.cloudflare.com/workers-ai
- https://developers.cloudflare.com/kv
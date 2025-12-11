# Copilot Model Selector

A VS Code extension that helps you select the appropriate AI model for your coding task.

## Features

- **Search Bar with Dropdown**: Quickly search for task types and see recommended AI models
- **Sidebar Panel**: Dedicated Activity Bar icon with expandable tree view of all model categories
- **Task Categories**: Speed, Code Generation, Architectural Reasoning, Long-Context Analysis, and more
- **Model Recommendations**: Get specific model recommendations based on your use case
- **Example Use Cases**: See examples of when to use each model category
- **Auto-Updates**: Automatically fetches latest model data from GitHub (checks every 24 hours)
- **Manual Refresh**: Click the refresh button in the sidebar to check for updates immediately

## How to Use

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac)
2. Type "Select AI Model for Task" and press Enter
3. Search for your use case (e.g., "speed", "debugging", "architecture")
4. Select a category to see recommended models and examples

## How to Test/Run

### Option 1: Run in Extension Development Host

1. Open this folder in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new window, press `Ctrl+Shift+P` and run "Select AI Model for Task"

### Option 2: Compile and Package

```bash
npm install
npm run compile
```

## Project Structure

```
.
├── src/
│   └── extension.ts       # Main extension code
├── out/                   # Compiled JavaScript output
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── .vscodeignore        # Files to exclude from extension package
```

## Development

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch for changes and recompile
- Press `F5` in VS Code to start debugging

## Keeping Data Up to Date

Model data is automatically updated from a GitHub repository. To customize the data source:

1. Go to Settings → Extensions → AI Model Selector
2. Configure:
   - **Data Source URL**: URL to your models.json file
   - **Auto Update**: Enable/disable automatic updates
   - **Update Interval**: Hours between update checks (default: 24)

### Creating Your Own Data Source

1. Fork or create a repository with a `models.json` file (see `data/models.json` for format)
2. Host it on GitHub (or any public URL)
3. Update the extension settings to point to your URL
4. The extension will fetch updates automatically

See `DATA_REPO_README.md` for details on the data format and how to maintain a data repository.

## Model Categories

- **Speed**: Fast models for simple tasks
- **Best Code Generation**: Top models for complex code generation
- **Architectural Reasoning**: Models that excel at understanding system architecture
- **Long-Context / Big File Analysis**: Models for analyzing large codebases
- **Balanced Daily Use**: All-purpose models for everyday tasks
- **Agent: Multi-step Debugging**: Models with agent capabilities for complex debugging
- **Agent: Repo Workflows**: Models for analyzing repository-wide workflows
- **Agent: Debugging Production**: Models for production issue analysis

## Requirements

- VS Code version 1.60.0 or higher

## License

MIT

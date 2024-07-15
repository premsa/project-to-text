# Project Markdown/Text Generator

## Description

Project Markdown/Text Generator is a Visual Studio Code extension that creates a comprehensive file of your current project structure and file contents in either Markdown or plain text format. It's designed to help developers quickly share their project details with AI tools like ChatGPT or with other developers.

## Features

- Generates a tree structure of your project
- Includes the content of all files in the project
- Organizes content by folders
- Provides separate commands for Markdown and plain text output
- Allows excluding specific folders or files
- Allows including files in the structure but excluding their content
- Copies the entire output to your clipboard
- Easy to use with simple commands

## Installation

1. Download the `.vsix` file from the [releases page](link-to-your-releases-page).
2. Open Visual Studio Code
3. Go to the Extensions view (Ctrl+Shift+X)
4. Click on the "..." at the top of the Extensions view
5. Choose "Install from VSIX..."
6. Select the downloaded `.vsix` file

## Usage

1. Open your project in VS Code
2. Open the Command Palette (Ctrl+Shift+P)
3. Type and select either:
   - "Project to Markdown" for Markdown output
   - "Project to Text" for plain text output
4. The extension will generate the content and copy it to your clipboard
5. Paste the content into your desired tool or document

## Configuration

You can configure the extension behavior using the following settings:

1. Exclude specific folders or files from the output:

```json
"projectToText.exclude": [
  "node_modules",
  "\\.git",
  "\\.vscode",
  "dist",
  "build"
]
```

2. Include files in the structure but exclude their content:

```json
"projectToText.contentExclude": [
  "package-lock\\.json",
  "yarn\\.lock",
  "large-data-file\\.json"
]
```
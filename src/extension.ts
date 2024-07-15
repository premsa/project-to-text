import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createProjectMarkdown', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        
        // Ask user for output format
        const outputFormat = await vscode.window.showQuickPick(['Markdown', 'Plain Text'], {
            placeHolder: 'Select output format'
        });

        if (!outputFormat) {
            return; // User cancelled the selection
        }

        let output = '';
        const isMarkdown = outputFormat === 'Markdown';

        // Generate content
        output += isMarkdown ? '# Project Structure\n\n' : 'Project Structure\n\n';
        output += await generateTreeStructure(rootPath, '', isMarkdown);
        output += isMarkdown ? '\n\n# File Contents\n\n' : '\nFile Contents\n\n';
        output += await generateFileContents(rootPath, isMarkdown);

        // Copy to clipboard
        await vscode.env.clipboard.writeText(output);

        vscode.window.showInformationMessage(`Project ${outputFormat} copied to clipboard`);
    });

    context.subscriptions.push(disposable);
}

async function generateTreeStructure(dir: string, prefix: string = '', isMarkdown: boolean): Promise<string> {
    let result = '';
    const files = await fs.promises.readdir(dir);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            result += `${prefix}${isMarkdown ? '📁' : '+'} ${file}\n`;
            result += await generateTreeStructure(filePath, prefix + '  ', isMarkdown);
        } else {
            result += `${prefix}${isMarkdown ? '📄' : '-'} ${file}\n`;
        }
    }

    return result;
}

async function generateFileContents(dir: string, isMarkdown: boolean): Promise<string> {
    let result = '';
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            result += isMarkdown ? `## 📁 ${file}\n\n` : `${file}\n${'='.repeat(file.length)}\n\n`;
            result += await generateFileContents(filePath, isMarkdown);
        } else {
            result += isMarkdown ? `### 📄 ${file}\n\n` : `${file}\n${'-'.repeat(file.length)}\n\n`;
            if (isMarkdown) {
                result += '```\n';
            }
            result += await fs.promises.readFile(filePath, 'utf8');
            if (isMarkdown) {
                result += '\n```\n\n';
            } else {
                result += '\n\n';
            }
        }
    }

    return result;
}

export function deactivate() {}
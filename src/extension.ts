import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let markdownDisposable = vscode.commands.registerCommand('extension.projectToMarkdown', async () => {
        await generateOutput(true);
    });

    let textDisposable = vscode.commands.registerCommand('extension.projectToText', async () => {
        await generateOutput(false);
    });

    context.subscriptions.push(markdownDisposable, textDisposable);
}

async function generateOutput(isMarkdown: boolean) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    let output = '';

    const config = vscode.workspace.getConfiguration('projectToText');
    const excludePatterns = config.get<string[]>('exclude', []);
    const contentExcludePatterns = config.get<string[]>('contentExclude', []);

    // Generate content
    output += isMarkdown ? '# Project Structure\n\n' : 'Project Structure\n\n';
    output += await generateTreeStructure(rootPath, '', isMarkdown, excludePatterns);
    output += isMarkdown ? '\n\n# File Contents\n\n' : '\nFile Contents\n\n';
    output += await generateFileContents(rootPath, isMarkdown, excludePatterns, contentExcludePatterns);

    // Copy to clipboard
    await vscode.env.clipboard.writeText(output);

    vscode.window.showInformationMessage(`Project ${isMarkdown ? 'Markdown' : 'Text'} copied to clipboard`);
}

async function generateTreeStructure(dir: string, prefix: string = '', isMarkdown: boolean, excludePatterns: string[]): Promise<string> {
    let result = '';
    const files = await fs.promises.readdir(dir);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (shouldExclude(filePath, excludePatterns)) {
            continue;
        }

        if (stats.isDirectory()) {
            result += `${prefix}${isMarkdown ? '📁' : '+'} ${file}\n`;
            result += await generateTreeStructure(filePath, prefix + '  ', isMarkdown, excludePatterns);
        } else {
            result += `${prefix}${isMarkdown ? '📄' : '-'} ${file}\n`;
        }
    }

    return result;
}

async function generateFileContents(dir: string, isMarkdown: boolean, excludePatterns: string[], contentExcludePatterns: string[]): Promise<string> {
    let result = '';
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (shouldExclude(filePath, excludePatterns)) {
            continue;
        }

        if (stats.isDirectory()) {
            result += isMarkdown ? `## 📁 ${file}\n\n` : `${file}\n${'='.repeat(file.length)}\n\n`;
            result += await generateFileContents(filePath, isMarkdown, excludePatterns, contentExcludePatterns);
        } else {
            result += isMarkdown ? `### 📄 ${file}\n\n` : `${file}\n${'-'.repeat(file.length)}\n\n`;
            if (shouldExclude(filePath, contentExcludePatterns)) {
                result += isMarkdown ? '```\n(Content excluded)\n```\n\n' : '(Content excluded)\n\n';
            } else {
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
    }

    return result;
}

function shouldExclude(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(filePath);
    });
}

export function deactivate() {}
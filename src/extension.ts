// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ExtensionContext, StatusBarAlignment, window, env, StatusBarItem, Selection, workspace, TextEditor, commands } from 'vscode';
import { basename } from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let getFunctionsListFromDocument = () => {
	let editor = window.activeTextEditor;
	let docText = editor?.document.getText() ?? '';
	let re = /(function\s+.+?\([\s\S]*?\)[\s\S]+?)\s*\{/g;
	let arr1 = [...docText?.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	console.log('arr1 is ');
	console.log(arr1.length);
	console.log(arr1);
	let functions = arr1.join("\n") + "\n";
	return functions;
}

let copyToClipboard = (text: string) => {
	// let wordToCopy = functions;
	env.clipboard.writeText(text).then((text) => {
		const message = `word ${text} is copied!`;
		vscode.window.showInformationMessage(message);
	});
}

// const provider2 = vscode.languages.registerCompletionItemProvider(
// 	'plaintext',
// 	{
// 		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

// 			// get all text until the `position` and check if it reads `console.`
// 			// and if so then complete if `log`, `warn`, and `error`
// 			const linePrefix = document.lineAt(position).text.substr(0, position.character);
// 			if (!linePrefix.endsWith('hey.')) {
// 				return undefined;
// 			}

// 			return [
// 				new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Method),
// 				new vscode.CompletionItem('how is solidity so far?', vscode.CompletionItemKind.Method),
// 				new vscode.CompletionItem('doing well ? ', vscode.CompletionItemKind.Method),
// 			];
// 		}
// 	},
// 	'.' // triggered whenever a '.' is being typed
// );

// context.subscriptions.push(provider1, provider2);

export function activate(context: vscode.ExtensionContext) {

	let disposableCopyFns = vscode.commands.registerCommand('sk-blockchain-helper.copy-functions', () => {
		let fns = getFunctionsListFromDocument();
		copyToClipboard(fns);
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'plaintext',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('hey.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('how is solidity so far?', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('doing well ? ', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(disposableCopyFns);
}

// this method is called when your extension is deactivated
export function deactivate() { }

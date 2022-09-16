// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ExtensionContext, StatusBarAlignment, window, env, StatusBarItem, Selection, workspace, TextEditor, commands } from 'vscode';
import { basename } from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let getFunctionsListFromDocumentForTestingAsString = () => {
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

let getFunctionNamesList = (text: string) => {
	// let editor = window.activeTextEditor;
	// let docText = editor?.document.getText() ?? '';
	let re = /(function\s+(.+?)\([\s\S]*?\)[\s\S]+?)\s*\{/g;
	let arr1 = [...text?.matchAll(re)].map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	return arr1;
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

let clipboard = '';

export function activate(context: vscode.ExtensionContext) {
	console.log('sk it is activateddddd ');

	let disposableCopyFns = vscode.commands.registerCommand('sk-blockchain-helper.copy-functions', () => {
		let fns = getFunctionsListFromDocumentForTestingAsString();
		copyToClipboard(fns);
	});

	let disposableImportContracts = vscode.commands.registerCommand('sk-blockchain-helper.import-contracts', async () => {
		let text = await vscode.env.clipboard.readText();
		clipboard = text;
	});



	const provider2 = vscode.languages.registerCompletionItemProvider(
		'plaintext',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('vault.')) {
					return undefined;
				}

				try {

					let txt = getFunctionNamesList(clipboard);
					console.log('text is ');
					console.log(txt);
					let arr = txt.map(e => new vscode.CompletionItem(e, vscode.CompletionItemKind.Method,),);
					return arr;

				} catch (error) {
					console.log('there is an error');
					console.log(error);
					return;
				}

				// return [
				// 	new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Function),
				// 	new vscode.CompletionItem('how is solidity so far?', vscode.CompletionItemKind.Method),
				// 	new vscode.CompletionItem('doing well ? ', vscode.CompletionItemKind.Method),
				// ];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider2, disposableCopyFns, disposableImportContracts);
}

// this method is called when your extension is deactivated
export function deactivate() { }

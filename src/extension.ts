// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ExtensionContext, StatusBarAlignment, window, env, StatusBarItem, Selection, workspace, TextEditor, commands } from 'vscode';
import { basename } from 'path';
// const fse = require('fs-extra')
import { readFileSync } from 'fs-extra';
import { posix } from 'path';
import { TextDecoder } from 'util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

enum SolitityType {
	FUNCTION,
	MODIFIER
}


enum SolitityVisibility {
	public,
	private,
}

interface solidityIdentifier {
	type: SolitityType,
	interface: string;
}

// let getSolidityIdentifiers = (text: string) => {
// 	let re = /((function|modifier)\s+.+?\([\s\S]*?\)[\s\S]+?)\s*\{/g;
// 	let arr1 = [...text.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'));
// 	let arr2 = arr1.map(e => {
// 		let m : SolitityType = 
// 		let obj: solidityIdentifier = { interface: e, type: SolitityType.FUNCTION };
// 		return {};
// 	})

// }





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

let readContracts = async () => {
	// let m = readFileSync('./contracts/Vault.sol');
	// let m = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(vscode.workspace.asRelativePath('.', true)));
	// let m = await vscode.workspace.fs.readDirectory(vscode.Uri.));
	// console.log(m);

	if (vscode.workspace.workspaceFolders == null) return;
	const workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;
	const folderPath = posix.relative(workspaceFolderUri.path, '/contracts/')
	console.log(folderPath);

	// window.activeTextEditor.document.uri;
	// const folderPath0 = posix.dirname(fileUri.path);
	// const folderPath = posis.relative(folderPath0, '../contracts/')
	// const folderUri = fileUri.with({ path: folderPath });
	// const doc = await vscode.workspace.openTextDocument({ content: "salamatooo" });

	// const p1 = vscode.window.activeTextEditor.document.uri.path;
	// const p2 = vscode.window.activeTextEditor.document.uri.path;
	// console.log(p1);
}

let contracts: Record<string, string> = {}

export async function activate(context: vscode.ExtensionContext) {
	// try {

	// 	readContracts();
	// 	console.log('salamat');
	// } catch (error) {
	// 	console.log('salamat');

	// }
	// console.log('salamat');
	// // }

	// // export async function activate(context: vscode.ExtensionContext) {
	console.log('salamat0');
	try {
		const workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;
		const folderPath = posix.relative(workspaceFolderUri.path, '/contracts/')
		console.log('salamat=============');
		console.log(workspaceFolderUri);
		console.log(workspaceFolderUri.path);
		console.log(workspaceFolderUri.fsPath);
		let folderContracts = posix.join(workspaceFolderUri.fsPath, '/contracts/');
		let path = vscode.Uri.parse(folderContracts);



		for (const [name, type] of await vscode.workspace.fs.readDirectory(path)) {

			if (type === vscode.FileType.File) {
				// only solidity 
				if (name.endsWith('.sol') === false) continue;
				let name2 = name.replace(/\.sol$/, '').toLowerCase();
				const filePath = posix.join(path.fsPath, name);
				const stat = await vscode.workspace.fs.stat(path.with({ path: filePath }));
				console.log('file path is ');
				const sampleTextEncoded = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
				const sampleText = new TextDecoder('utf-8').decode(sampleTextEncoded);
				contracts[name2] = sampleText;
			}
		}

		console.log(Object.keys(contracts));
		console.log('----------------');

		console.log(folderContracts);
		console.log('salamatoooo=================');
		// await readContracts();
	} catch (error) {
		console.log('error is ');
		console.log(error);

		console.log('done');

		console.log('sk it is activateddddd 0');

		let disposableCopyFns = vscode.commands.registerCommand('sk-blockchain-helper.copy-functions', () => {
			let fns = getFunctionsListFromDocumentForTestingAsString();
			copyToClipboard(fns);
		});

		let disposableImportContracts = vscode.commands.registerCommand('sk-blockchain-helper.import-contracts', async () => {
			let text = await vscode.env.clipboard.readText();
			clipboard = text;
		});







		const provider2 = vscode.languages.registerCompletionItemProvider(
			'javascript',
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
}

// this method is called when your extension is deactivated
export function deactivate() { }

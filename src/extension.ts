// https://github.com/Janne252/vscode-test-signatureHelpProvider/

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {
	ExtensionContext,
	StatusBarAlignment,
	window,
	env,
	StatusBarItem,
	Selection,
	workspace,
	TextEditor,
	commands,
	SignatureHelp,
	SignatureHelpProvider as ISignatureHelpProvider,
	SignatureInformation

} from 'vscode';
import { basename } from 'path';
// const fse = require('fs-extra')
import { readFileSync } from 'fs-extra';
import { posix } from 'path';
import { TextDecoder } from 'util';

// import {
// 	ExtensionContext, languages,
// 	SignatureHelp,
// 	SignatureHelpProvider as ISignatureHelpProvider,
// 	SignatureInformation
// } from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

enum SolitityType {
	FUNCTION,
	MODIFIER,


}


enum SolitityVisibility {
	public,
	private,
}

interface solidityIdentifier {
	type: SolitityType,
	interface: string;
}

interface SolidityVariableInfo {
	type:  string,
	name: string,
	line: string
}


let clipboard = '';
let contractName2ContractText: Record<string, string> = {}
let contractName2FunctionsList: Record<string, string[]> = {}
let contractName2VariablesList: Record<string, SolidityVariableInfo[]> = {}



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

let getPublicFromDocumentForTestingAsString = () => {
	let editor = window.activeTextEditor;
	let docText = editor?.document.getText() ?? '';
	// let re = /^\s+(.*?)\s+(?<visibility>public|private)\s*(constant)?\s*(?<name>.+?)(\s+|;)/gm;
	let re = /^\s+([^\/]*?)\s+(?<visibility>public|private)?\s*/gm;
	let arr1 = [...docText?.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	console.log('arr1 is ');
	console.log(arr1.length);
	console.log(arr1);
	let functions = arr1.join("\n") + "\n";
	return functions;
}


let getFunctionNamesList = (text: string) => {
	let re = /(function\s+(.+?)\([\s\S]*?\)[\s\S]+?)\s*\{/g;
	let arr1 = [...text?.matchAll(re)].map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	return arr1;
}

let getPublicParameters = (text: string) => {
	let re = /^\s*(?<type>((mapping\(.+?\))|address|uint\d+|string|[A-z]+)([])?) ?(?<visibility>public|private|external|internal)? ?(?:(constant|immutable) )?(?<name>([a-zA-Z0-9_]*))\s*(=.*)?;/gm;
	let arr1 = [...text?.matchAll(re)]; // .map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	console.log('salamt');

	// contractName2VariablesList.
	
	// return arr1;

	// const { groups: { token } } = /Bearer (?<token>[^ $]*)/.exec()
	// console.log(token)
}


let copyToClipboard = (text: string) => {
	// let wordToCopy = functions;
	env.clipboard.writeText(text).then((text) => {
		const message = `word ${text} is copied!`;
		vscode.window.showInformationMessage(message);
	});
}


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


let injectContractsFromContractsFolder = async () => {
	const workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;
	let folderContracts = posix.join(workspaceFolderUri.fsPath, '/contracts/');
	let path = vscode.Uri.parse(folderContracts);
	for (const [name, type] of await vscode.workspace.fs.readDirectory(path)) {
		if (type === vscode.FileType.File) {
			if (name.endsWith('.sol') === false) continue;
			let name2 = name.replace(/\.sol$/, '').toLowerCase();
			const filePath = posix.join(path.fsPath, name);
			// const stat = await vscode.workspace.fs.stat(path.with({ path: filePath }));
			console.log('file path is ');
			console.log(filePath);
			const sampleTextEncoded = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
			const sampleText = new TextDecoder('utf-8').decode(sampleTextEncoded);
			contractName2ContractText[name2] = sampleText;
		}
	}
}


let extractContractFunctionFromContractsTextMap = () => {
	for (const [name, text] of Object.entries(contractName2ContractText)) {
		let re = /(function\s+(.+?)\([\s\S]*?\)[\s\S]+?)\s*\{/g;
		let arr1 = [...text?.matchAll(re)].map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
		contractName2FunctionsList[name] = arr1;
	}
}


let extractContractVariablesFromContractsTextMap = () => {
	for (const [name, text] of Object.entries(contractName2ContractText)) {
		let re = /(function\s+(.+?)\([\s\S]*?\)[\s\S]+?)\s*\{/g;
		let arr1 = [...text?.matchAll(re)].map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
		contractName2FunctionsList[name] = arr1;
	}
}


let initContractsData = async () => {
	await injectContractsFromContractsFolder();
	extractContractFunctionFromContractsTextMap();
}


const disposableCopyFns = vscode.commands.registerCommand('sk-blockchain-helper.copy-functions', () => {
	let fns = getFunctionsListFromDocumentForTestingAsString();
	copyToClipboard(fns);
});

const disposableImportContracts = vscode.commands.registerCommand('sk-blockchain-helper.import-contracts', async () => {
	let text = await vscode.env.clipboard.readText();
	clipboard = text;
});


let updateContractsData = () => {
	initContractsData();
}

export async function activate(context: vscode.ExtensionContext) {
	// await new Promise(resolve => setTimeout(resolve, 3000));
	await initContractsData();
	await new Promise(resolve => setTimeout(resolve, 300));

	const contractFunctionsProvider = vscode.languages.registerCompletionItemProvider(
		'javascript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				let contractNames = Object.keys(contractName2ContractText);
				let name;
				for (let i = 0; i < contractNames.length; i++) {
					const contractName = contractNames[i];
					if (linePrefix.endsWith(contractName + ".")) {
						name = contractName;
						break;
					}
				}
				if (!name) { return; }
				let fns = contractName2FunctionsList[name];

				try {
					let arr = fns.map(e => {
						let m = new vscode.CompletionItem(e, vscode.CompletionItemKind.Function,);
						m.sortText = "aaa";
						m.documentation = "do something";
						return m;
					},);
					console.log('salamattt');
					// 	return [new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Function),];
					return [...arr];

				} catch (error) {
					console.log('there is an error');
					console.log(error);
					return;
				}

			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(contractFunctionsProvider, disposableCopyFns, disposableImportContracts);

	// TODO add signatures here



}

// this method is called when your extension is deactivated
export function deactivate() { }
























// let getSolidityIdentifiers = (text: string) => {
// 	let re = /((function|modifier)\s+.+?\([\s\S]*?\)[\s\S]+?)\s*\{/g;
// 	let arr1 = [...text.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'));
// 	let arr2 = arr1.map(e => {
// 		let m : SolitityType = 
// 		let obj: solidityIdentifier = { interface: e, type: SolitityType.FUNCTION };
// 		return {};
// 	})

// }

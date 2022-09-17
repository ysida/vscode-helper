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


interface ContractFunctionInfo {
	name: string,
	line: string,
	visibility: string,
	argumentsString: string,
	arguments: string[],
}


interface ContractVariableInfo {
	type: string,
	name: string,
	line: string,
	visibility: string
}


let clipboard = '';
let contractName2ContractText: Record<string, string> = {}
let contractName2FunctionsList0: Record<string, string[]> = {}
let contractName2FunctionsInfo: Record<string, ContractFunctionInfo[]> = {}
let contractName2VariablesInfo: Record<string, ContractVariableInfo[]> = {}



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

let getContractFunctionsInfo = (text: string) => {
	let text1 = text;
	// text1 = text.replace(/struct [A-Z][\s\S]+?\}/, '');
	// text1 = text.replace(/event [A-Z][\s\S]+?\);/, '');
	// text1 = text.replace(/if \([\s\S]+?\}.*/, '');
	// text1 = text.replace(/else \([\s\S]+?\}.*/, '');
	// text1 = text.replace(/function [a-z_][\s\S]+?\}.*/, '');
	// text1 = text.replace(/modifier [a-z_][\s\S]+?\}.*/, '');

	text1 = text.replace(/\s+/g, ' ');


	// let arr1 = [...docText?.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
	// console.log('arr1 is ');
	// console.log(arr1.length);
	// console.log(arr1);
	// let functions = arr1.join("\n") + "\n";
	// return functions;

	// let re = /^\s*(?<type>((mapping\(.+?\))|address|uint\d+|string|bytes\d+|bool|[A-Z][A-z]+)([])?) (?<visibility>public|private|external|internal)? ?(?:(constant|immutable) )?(?<name>([a-zA-Z0-9_]*))\s*(=.*)?;/gm;
	let re = /\s+(function\s+(?<name>.+?)\((?<arguments>[\s\S]*?)\)[\s\S]+?)\s*\{/g;

	let l;
	let infos: ContractFunctionInfo[] = []; // {line: '', type: '', name: ''};
	while (l = re.exec(text1)) {
		if (l.groups == null) continue;
		let arguments1: string[] = [];
		arguments1 = l.groups['arguments'].split(',').map(e => e.trim());

		// " function transferOwnership(address _newOwner) external onlyOwner {"
		let line = l[0].replace(/\s+(.*)\s+\{\s*/, '$1')

		let info: ContractFunctionInfo = {
			line: line, // l[0],
			name: l.groups['name'],
			visibility: l.groups['visibility'],
			argumentsString: l.groups['arguments'],
			arguments: arguments1,
		}
		infos.push(info);
	}
	return infos;
}

let getContractVariablesInfo = (text: string) => {
	let text1 = text;
	text1 = text.replace(/struct [A-Z][\s\S]+?\}/, '');
	text1 = text.replace(/event [A-Z][\s\S]+?\);/, '');
	text1 = text.replace(/if \([\s\S]+?\}.*/, '');
	text1 = text.replace(/else \([\s\S]+?\}.*/, '');
	text1 = text.replace(/function [a-z_][\s\S]+?\}.*/, '');
	text1 = text.replace(/modifier [a-z_][\s\S]+?\}.*/, '');

	let re = /^\s*(?<type>((mapping\(.+?\))|address|uint\d+|string|bytes\d+|bool|[A-Z][A-z]+)([])?) (?<visibility>public|private|external|internal)? ?(?:(constant|immutable) )?(?<name>([a-zA-Z0-9_]*))\s*(=.*)?;/gm;
	let l;
	let infos: ContractVariableInfo[] = []; // {line: '', type: '', name: ''};
	while (l = re.exec(text1)) {
		if (l.groups == null) continue;
		let info: ContractVariableInfo = {
			line: l[0],
			type: l.groups['type'],
			name: l.groups['name'],
			visibility: l.groups['visibility']
		}
		infos.push(info);
	}
	return infos;
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
		contractName2FunctionsList0[name] = arr1;
	}
}


let extractContractVariablesFromContractsTextMap = () => {
	for (const [name, text] of Object.entries(contractName2ContractText)) {
		var infos = getContractVariablesInfo(text);
		contractName2VariablesInfo[name] = infos;
	}
}

let extractContractFunctionsFromContractsTextMap = () => {
	for (const [name, text] of Object.entries(contractName2ContractText)) {
		var infos = getContractFunctionsInfo(text);
		contractName2FunctionsInfo[name] = infos;
	}
}


let initContractsData = async () => {
	await injectContractsFromContractsFolder();
	extractContractFunctionFromContractsTextMap();
	extractContractVariablesFromContractsTextMap();
	extractContractFunctionsFromContractsTextMap();
}


const disposableCopyFns = vscode.commands.registerCommand('sk-blockchain-helper.copy-functions', () => {
	let fns = getFunctionsListFromDocumentForTestingAsString();
	copyToClipboard(fns);
});

const disposableUpdateContractData = vscode.commands.registerCommand('sk-blockchain-helper.update-contracts-data', () => {
	initContractsData();
});

const disposableImportContracts = vscode.commands.registerCommand('sk-blockchain-helper.import-contracts', async () => {
	let text = await vscode.env.clipboard.readText();
	clipboard = text;
});



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
				let fns = contractName2FunctionsList0[name];
				let arr: vscode.CompletionItem[] = [];

				// add fns
				try {
					arr = [...arr, ...fns.map(e => {
						let m = new vscode.CompletionItem(e, vscode.CompletionItemKind.Function,);
						m.sortText = "bbb";
						m.documentation = "do something";
						return m;
					},)];
					console.log('salamattt');
					// 	return [new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Function),];

				} catch (error) {
					console.log('there is an error');
					console.log(error);
					return;
				}


				let variables = contractName2VariablesInfo[name];

				// add variables
				try {
					arr = [...arr, ...variables.map(e => {
						let m = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Variable);
						m.sortText = "aaa";
						m.documentation = "some variable";
						return m;
					},)];
					console.log('salamattt');
					// 	return [new vscode.CompletionItem('supMan', vscode.CompletionItemKind.Function),];

				} catch (error) {
					console.log('there is an error');
					console.log(error);
					return;
				}

				return arr;

			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(
		disposableCopyFns,
		disposableImportContracts,
		disposableUpdateContractData,
		contractFunctionsProvider,
	);

	let registerFunctionSignature = (fnInfo: ContractFunctionInfo, instanceName: string) => {
		var m: ISignatureHelpProvider = {
			provideSignatureHelp: (document, position, token) => {
				let lineText = document.lineAt(position.line).text;
				var count = (lineText.match(/,/g) || []).length

				let paramsInfo: vscode.ParameterInformation[] = [];
				for (let i = 0; i < fnInfo.arguments.length; i++) {
					const argument = fnInfo.arguments[i];
					let m: vscode.ParameterInformation = {
						label: argument,
						// documentation: argument,
					};
					paramsInfo.push(m);
				}

				return <SignatureHelp>
					{
						id: fnInfo.name, //  "work_babatooo",
						name: fnInfo.name,
						activeParameter: count,
						activeSignature: 0,
						signatures: <SignatureInformation[]>
							[
								{
									label: fnInfo.line,
									parameters: paramsInfo,
								}
							],
						parameterCount: paramsInfo.length,
						lastParameterIsList: false
					};
			},
		};
		let triggerName = instanceName + "." + fnInfo.name;

		context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(
			'javascript',
			m,
			triggerName,
		));
	};

	for (const [contractName, value] of Object.entries(contractName2FunctionsInfo)) {
		for (let i = 0; i < value.length; i++) {
			const element = value[i];
			registerFunctionSignature(element, contractName);
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
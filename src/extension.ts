// https://github.com/Janne252/vscode-test-signatureHelpProvider/

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fse from 'fs-extra';

import {
	window,
	env,
	SignatureHelp,
	SignatureHelpProvider as ISignatureHelpProvider,
	SignatureInformation

} from 'vscode';
import { posix } from 'path';
import { TextDecoder } from 'util';

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


let getContractFunctionsInfo = (text: string) => {
	let text1 = text;

	text1 = text.replace(/\s+/g, ' ');

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
	env.clipboard.writeText(text).then((text) => {
		// const message = `word ${text} is copied!`;
		// vscode.window.showInformationMessage(message);
	});
}

let injectContractsFromContractsFolder = async () => {
	const workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;

	let paths: string[] = [];
	let relativePaths = ['/contracts', '/packages/hardhat/contracts']
	for (let i = 0; i < relativePaths.length; i++) {
		const path = posix.join(workspaceFolderUri.fsPath, relativePaths[i]);
		paths.push(path);
	}

	for (let i = 0; i < paths.length; i++) {
		try {

			const pathString = paths[i];
			// vscode.workspace.fs.exis
			if (fse.existsSync(pathString) !== true) continue;
			let pathUri = vscode.Uri.parse(pathString);

			for (const [name, type] of await vscode.workspace.fs.readDirectory(pathUri)) {
				if (type === vscode.FileType.File) {
					if (name.endsWith('.sol') === false) continue;
					let name2 = name.replace(/\.sol$/, '').toLowerCase();
					const filePath = posix.join(pathUri.fsPath, name);
					// const stat = await vscode.workspace.fs.stat(path.with({ path: filePath }));
					console.log('file path is ');
					console.log(filePath);
					const sampleTextEncoded = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
					const sampleText = new TextDecoder('utf-8').decode(sampleTextEncoded);
					contractName2ContractText[name2] = sampleText;
				}
			}
		} catch (error) {

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
	// TODO 
});


const doAll1 = async (context: vscode.ExtensionContext) => {

	await initContractsData();
	await new Promise(resolve => setTimeout(resolve, 200));

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
						m.sortText = "aaa";
						m.documentation = "do something";
						return m;
					},)];

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
						m.sortText = "bbb";
						// m.documentation = "some variable";
						return m;
					},)];

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

		let functionHelpProvider: ISignatureHelpProvider = {
			provideSignatureHelp: (document, position, token, context) => {
				let lineText = document.lineAt(position.line).text;
				let triggerName = instanceName + "." + fnInfo.name + '(';
				if (!lineText.includes(triggerName)) return;

				var count = (lineText.match(/,/g) || []).length;

				let paramsInfo: vscode.ParameterInformation[] = [];
				for (let i = 0; i < fnInfo.arguments.length; i++) {
					const argument = fnInfo.arguments[i];
					let m: vscode.ParameterInformation = {
						label: argument,
						// documentation: argument,
					};
					paramsInfo.push(m);
				}


				let name = instanceName + "." + fnInfo.name;
				return <SignatureHelp>
					{
						id: name,
						// fnInfo.name + (Math.floor(Math.random() * 1000).toString()), //  "work_babatooo",
						name: name, // fnInfo.name,
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
						lastParameterIsList: false,
					};
			},
		};


		context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(
			'javascript',
			functionHelpProvider,
			'(' // trigger character
		));
	};

	for (const [contractName, value] of Object.entries(contractName2FunctionsInfo)) {
		for (let i = 0; i < value.length; i++) {
			const element1 = value[i];
			registerFunctionSignature(element1, contractName);
		}
	}
}

export async function activate(context: vscode.ExtensionContext) {
	doAll1(context);
}

export function deactivate() { }
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


const disposablePasteTextAsSnippet = vscode.commands.registerCommand('sk-vscode-helper.copy-functions', () => {
	vscode.env.clipboard.readText().then((text) => {


		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		let str = text;
		str = str.replace(/(?:\r\n|\r|\n)/g, '\\\\n');

		editor.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, text);
		});

	});

});



export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		disposablePasteTextAsSnippet,
	);
}

export function deactivate() { }
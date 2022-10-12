import * as vscode from 'vscode';

const disposablePasteTextAsSnippet = vscode.commands.registerCommand('sk-vscode-helper.paste-snippets-template', () => {

	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	vscode.env.clipboard.readText().then((text) => {

		let str = text;
		str = str.replace(/(?:\r\n|\r|\n)/g, '\\\\n');

		editor.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, str);
		});
	});
});

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		disposablePasteTextAsSnippet,
	);
}

export function deactivate() { }
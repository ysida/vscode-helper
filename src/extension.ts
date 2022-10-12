import * as vscode from 'vscode';


export async function activate(context: vscode.ExtensionContext) {

	const disposablePasteTextAsSnippet = vscode.commands.registerCommand('sk-vscode-helper.paste-escaped-snippets-text', () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		vscode.env.clipboard.readText().then((text) => {

			let str = text;
			str = str.replace(/(?:\r\n|\r|\n)$/gm, '\\n'); // put newlines special character
			str = str.replace(/"/g, '\\"'); // replace " with \"

			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, str);
			});
		});
	});

	context.subscriptions.push(
		disposablePasteTextAsSnippet,
	);

	const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
}



export function deactivate() { }
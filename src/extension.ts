import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {

	const disposablePasteTextAsSnippet = vscode.commands.registerCommand('sk-vscode-helper.paste-escaped-snippets-text', () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		vscode.env.clipboard.readText().then((text) => {
			console.log(JSON.stringify(text));
			let str = text;
			str = str.replace(/^\s*/g, ''); // put newlines special character
			str = str.replace(/(?:\\n)/g, '\\\n'); // put newlines special character
			str = str.replace(/(?:\r\n|\r|\n)/g, '\\n'); // put newlines special character

			// str = str.replace(/(?:\\t)/g, '\\\t'); // put newlines special character
			// str = str.replace(/(?:\t)/g, '\\t'); // put newlines special character

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
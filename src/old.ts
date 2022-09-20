// let readContracts = async () => {
// 	// let m = readFileSync('./contracts/Vault.sol');
// 	// let m = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(vscode.workspace.asRelativePath('.', true)));
// 	// let m = await vscode.workspace.fs.readDirectory(vscode.Uri.));
// 	// console.log(m);

// 	if (vscode.workspace.workspaceFolders == null) return;
// 	const workspaceFolderUri = vscode.workspace.workspaceFolders![0].uri;
// 	const folderPath = posix.relative(workspaceFolderUri.path, '/contracts/')
// 	console.log(folderPath);

// 	// window.activeTextEditor.document.uri;
// 	// const folderPath0 = posix.dirname(fileUri.path);
// 	// const folderPath = posis.relative(folderPath0, '../contracts/')
// 	// const folderUri = fileUri.with({ path: folderPath });
// 	// const doc = await vscode.workspace.openTextDocument({ content: "salamatooo" });

// 	// const p1 = vscode.window.activeTextEditor.document.uri.path;
// 	// const p2 = vscode.window.activeTextEditor.document.uri.path;
// 	// console.log(p1);
// }


// let getPublicFromDocumentForTestingAsString = () => {
// 	let editor = window.activeTextEditor;
// 	let docText = editor?.document.getText() ?? '';
// 	// let re = /^\s+(.*?)\s+(?<visibility>public|private)\s*(constant)?\s*(?<name>.+?)(\s+|;)/gm;
// 	let re = /^\s+([^\/]*?)\s+(?<visibility>public|private)?\s*/gm;
// 	let arr1 = [...docText?.matchAll(re)].map(e => e[1].replace(/\s+/g, ' ').replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
// 	console.log('arr1 is ');
// 	console.log(arr1.length);
// 	console.log(arr1);
// 	let functions = arr1.join("\n") + "\n";
// 	return functions;
// }


// let getFunctionNamesList = (text: string) => {
// 	let re = /(function\s+(.+?)\([\s\S]*?\)[\s\S]+?)\s*\{/g;
// 	let arr1 = [...text?.matchAll(re)].map(e => e[2].replace(/\s+/gm, '')); // .replace(/^/gm, '- [ ] ').replace(/$/gm, ';'))
// 	return arr1;
// }
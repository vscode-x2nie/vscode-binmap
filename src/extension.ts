import { ClientRequest } from 'http';
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	let timeout: NodeJS.Timer | undefined = undefined;


	const BothBitStyle = {
		overviewRulerLane: vscode.OverviewRulerLane.Center,
		letterSpacing:'2px',
		// borderWidth: '6px',
		borderStyle: 'solid',
		borderColor: 'transparent',
		backgroundColor: { id: 'selection.background' },	
		before: {
			contentText: '',
			width: '4px',
			backgroundColor: 'transparent',
		},
		after: {
			contentText: '',
			width: '4px',
			backgroundColor: 'transparent',
		},
	}
	const fade = {
		backgroundColor: 'default',
		color: '#666',
		borderColor: 'transparent',
	}
	// create a decorator type that we use to decorate small numbers
	const preBitDecorationType = vscode.window.createTextEditorDecorationType({
		...BothBitStyle,
		...fade
	})
	const tailBitDecorationType = vscode.window.createTextEditorDecorationType({
		...fade
	})
	const bitOneDecorationType = vscode.window.createTextEditorDecorationType({
		...BothBitStyle,
		// overviewRulerLane: vscode.OverviewRulerLane.Center,
		// overviewRulerColor: 'blue',
		// overviewRulerLane: vscode.OverviewRulerLane.Right,
		color: '#888',
		backgroundColor: '#ccc',
		// borderColor: 'transparent',
		// letterSpacing:'32px',
		light: {
			// this color will be used in light color themes
			color: '#aaa',
			// borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			// borderColor: 'lightblue'
		}
	});

	// create a decorator type that we use to decorate large numbers
	const bitZeroDecorationType = vscode.window.createTextEditorDecorationType({
		...BothBitStyle,
		// cursor: 'crosshair',
		color: '#444',
		backgroundColor: '#00000066',
		// use a themable color. See package.json for the declaration and default values.
		light: {
			color: '#44444466',
			// this color will be used in light color themes
			// borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			// borderColor: 'lightblue'
		}

		// backgroundColor: { id: 'myextension.largeNumberBackground' }
		
		// borderWidth: '7px'	
		// color: { id: 'comments.foreground' }
		// before: {
		// 	contentText: '',
		// 	width: '5px',
		// 	backgroundColor: 'fuchsia',
		// }
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const regEx = /\b0[x]*[bB]+([01]+)(,|\b)/g;
		const regBin = /([0]+|[1]+)/g;
		const doc = activeEditor.document;
		const text = activeEditor.document.getText();
		const preNumbers: vscode.DecorationOptions[] = [];
		const oneNumbers: vscode.DecorationOptions[] = [];
		const zeroNumbers: vscode.DecorationOptions[] = [];
		const tailNumbers: vscode.DecorationOptions[] = [];
		let word;
		while ((word = regEx.exec(text))) {
			const wholeWord = word[0];	//? 0b1100 | b1100 
			const binWord = word[1];	//?   1100
			const tail = word[2];		//?       `,`
			const preWide = wholeWord.length - (binWord.length + tail.length); // 1
			const firstBin = word.index + preWide;

			//pre
			const startPos0 = activeEditor.document.positionAt(word.index);
			const endPos0 = activeEditor.document.positionAt(firstBin);
			const decoration0 = { range: new vscode.Range(startPos0, endPos0), hoverMessage: 'Number **' + word[0] + '**' };
			preNumbers.push(decoration0);

			//post
			if(word[2]){ // trailing comma
				const startPos = startPos0.translate(0, preWide + word[1].length);
				const endPos = startPos0.translate(0, word[0].length+1)
				const decorationn = { range: new  vscode.Range(startPos, endPos)};
				tailNumbers.push(decorationn);
			}

			//binaries
			[...binWord].forEach((bit, i)=>{
				const startPos = startPos0.translate(0, preWide + i);
				const endPos   = startPos0.translate(0, preWide + i + 1);

				const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + binWord + '**' };
				if (bit.startsWith('1')) {
					oneNumbers.push(decoration);
				} else {
					zeroNumbers.push(decoration);
				}

			});

		}
		activeEditor.setDecorations(preBitDecorationType, preNumbers);
		activeEditor.setDecorations(tailBitDecorationType, tailNumbers);
		activeEditor.setDecorations(bitOneDecorationType, oneNumbers);
		activeEditor.setDecorations(bitZeroDecorationType, zeroNumbers);
	}

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);

}


import * as vscode from 'vscode';

export class SessionInputProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'inputSessionId';
	private view?: vscode.WebviewView;
	private connectionID: string = '';

	constructor(private context: vscode.ExtensionContext) { console.log('SessionInputProvider initialized'); }

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this.view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			enableCommandUris: true,
			localResourceRoots: [this.context.extensionUri]
		};

		webviewView.webview.html = this.getHtmlContent();

		webviewView.webview.onDidReceiveMessage(message => {
			if (message.command === 'updateInput') {
				this.connectionID = message.value;
				console.log('Session ID updated:', this.connectionID);
			}
		});

		console.log('SessionInputProvider WebView resolved');
	}
	public setSessionID(value: string): void {
		this.connectionID = value;
		if (this.view) {
			this.view.webview.postMessage({ command: 'updateInput', value });
		}
	}

	private getHtmlContent(): string {
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
				<style>
					body {
						font-family: var(--vscode-font-family);
						color: var(--vscode-foreground);
						padding: 16px;
						margin: 0;
						background-color: transparent;
					}
					.input-container {
						display: flex;
						flex-direction: column;
						gap: 8px;
					}
					label {
						font-weight: 500;
						font-size: 12px;
					}
					input {
						padding: 8px 12px;
						border: 1px solid var(--vscode-input-border, #666);
						background-color: var(--vscode-input-background, #3c3c3c);
						color: var(--vscode-input-foreground, #cccccc);
						font-family: var(--vscode-font-family);
						border-radius: 2px;
						font-size: 13px;
						width: 100%;
						box-sizing: border-box;
					}
					input:focus {
						outline: none;
						border-color: var(--vscode-focusBorder, #007acc);
						background-color: var(--vscode-input-background, #3c3c3c);
					}
					input::placeholder {
						color: var(--vscode-input-placeholderForeground, #888888);
					}
				</style>
			</head>
			<body>
				<div class="input-container">
					<label for="sessionIdInput">Session ID:</label>
					<input
						type="text"
						id="sessionIdInput"
						placeholder="Enter session ID"
						spellcheck="false"
						autocomplete="off"
					>
				</div>
				<script>
					const vscode = acquireVsCodeApi();
					const input = document.getElementById('sessionIdInput');

					if (input) {
						// Send message on each keystroke
						input.addEventListener('input', (e) => {
							vscode.postMessage({
								command: 'updateInput',
								value: input.value
							});
						});

						// Also handle change event for completeness
						input.addEventListener('change', (e) => {
							vscode.postMessage({
								command: 'updateInput',
								value: input.value
							});
						});

						// Handle clear input message from extension
						window.addEventListener('message', (event) => {
							const message = event.data;
							if (message.command === 'clearInput') {
								input.value = '';
								input.focus();
							}
						});

						// Focus the input when loaded
						input.focus();
					}
				</script>
			</body>
			</html>
		`;
	}

	public getInputValue(): string {
		return this.connectionID;
	}

	public clearInput(): void {
		this.connectionID = '';
		if (this.view) {
			this.view.webview.postMessage({ command: 'clearInput' });
		}
	}
}

'use strict';

import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	Hover,
	TextDocumentPositionParams,
	MarkupKind,
	MarkupContent,
} from 'vscode-languageserver';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();
const keywords: { [name: string]: { required: string, parameters: string, allowed: string } } = {
	agent: {
		required: 'Yes',
		parameters: 'https://jenkins.io/doc/book/pipeline/syntax/#agent-parameters',
		allowed: 'In the top-level pipeline block and each stage block.'
	},
	post: {
		required: 'No',
		parameters: 'None',
		allowed: 'In the top-level pipeline block and each stage block.'
	},
	stages: {
		required: 'Yes',
		parameters: 'None',
		allowed: 'Only once, inside the pipeline block.'
	},
	steps: {
		required: 'Yes',
		parameters: 'None',
		allowed: 'Inside each stage block.'
	},
	environment: {
		required: 'No',
		parameters: 'None',
		allowed: 'Inside the pipeline block, or within stage directives.'
	},
	options: {
		required: 'No',
		parameters: 'None',
		allowed: 'Only once, inside the pipeline block.'
	},
	parameters: {
		required: 'No',
		parameters: 'None',
		allowed: 'Only once, inside the pipeline block.'
	},
	triggers: {
		required: 'No',
		parameters: 'None',
		allowed: 'Only once, inside the pipeline block.'
	},
	stage: {
		required: 'At least one',
		parameters: 'One mandatory parameter, a string for the name of the stage.',
		allowed: 'Inside the stages section.'
	},
	tools: {
		required: 'No',
		parameters: 'None',
		allowed: 'Inside the pipeline block or a stage block.'
	},
	when: {
		required: 'No',
		parameters: 'None',
		allowed: 'Inside a stage directive'
	}
	
};

connection.onInitialize((params: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			hoverProvider: true
		}
	};
});

connection.onHover(
	(_textDocumentPosition: TextDocumentPositionParams): Hover => {
		let document = documents.get(_textDocumentPosition.textDocument.uri);
		let offset = document.offsetAt(_textDocumentPosition.position);
		let text = document.getText();
		let word = getWordAt(text, offset);
		let desc = keywords[word];
		if (desc == null) {
			return null;
		}
		let markdown: MarkupContent = {
			kind: MarkupKind.Markdown,
			value: [`**Required:** ${desc.required}   `,
			`**Parameters:** ${desc.parameters}   `,
			`**Allowed:** ${desc.allowed}   `]
				.join('\r')
		};
		return {
			contents: markdown
		};
	});

function getWordAt(str, pos) {
	str = String(str);
	pos = Number(pos) >>> 0;

	var left = str.slice(0, pos + 1).search(/\w+$/),
		right = str.slice(pos).search(/\W/);

	if (right < 0) {
		return str.slice(left);
	}

	return str.slice(left, right + pos);
}

documents.listen(connection);
connection.listen();
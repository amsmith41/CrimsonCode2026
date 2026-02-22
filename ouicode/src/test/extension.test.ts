import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as filter from '../file_filter';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		//assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		//assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('File filter test', () => {
		let test: filter.FileFolderList = {
			files: [
				{
					name: "included file",
					selected: true,
					type: "file",
					children: []
				},
				{
					name: "excluded file",
					selected: false,
					type: "file",
					children: []
				},
				{
					name: "included folder",
					selected: true,
					type: "folder",
					children: [
						{
							name: "default included sub-file",
							selected: true, // Doesn't matter, isn't parsed
							type: "file", 
							children: []
						},
						{
							name: "default included folder",
							selected: true, // Doesn't matter, isn't parsed
							type: "folder", 
							children: [
								{
									name: "default included sub-sub-file",
									selected: true, // Doesn't matter, isn't parsed
									type: "file", 
									children: []
								}
							]
						},
						{
							name: "excluded folder",
							selected: false,
							type: "folder",
							children: []
						}
					]
				},
				{
					name: "excluded folder",
					selected: false,
					type: "folder",
					children: [
						{
							name: "included sub-file",
							selected: true, // Doesn't matter, isn't parsed
							type: "file", 
							children: []
						},
						{
						name: "included folder",
						selected: true, // Doesn't matter, isn't parsed
						type: "file",
						children: []
						},
						{
							name: "excluded sub-file",
							selected: false, // Doesn't matter, isn't parsed
							type: "file", 
							children: []
						}
					]
				}
			]
		};
		console.log(JSON.stringify(filter.filterJsonFileList(test), null, 2));
		assert.deepStrictEqual(filter.filterJsonFileList(test),({
			files: [
				{
					name: "included file",
					selected: true,
					type: "file",
					children: []
				},
				{
					name: "included folder",
					selected: true,
					type: "folder",
					children: [
						{
							name: "default included sub-file",
							selected: true, // Doesn't matter, isn't parsed
							type: "file", 
							children: []
						},
						{
							name: "default included folder",
							selected: true, // Doesn't matter, isn't parsed
							type: "folder", 
							children: [
								{
									name: "default included sub-sub-file",
									selected: true, // Doesn't matter, isn't parsed
									type: "file", 
									children: []
								}
							]
						},
						{
							name: "excluded folder",
							selected: false,
							type: "folder",
							children: []
						}
					]
				},
				{
					name: "excluded folder",
					selected: false,
					type: "folder",
					children: [
						{
							name: "included sub-file",
							selected: true, // Doesn't matter, isn't parsed
							type: "file", 
							children: []
						},
						{
						name: "included folder",
						selected: true, // Doesn't matter, isn't parsed
						type: "file",
						children: []
						}
					]
				}
			]
		} as filter.FileFolderList));
	});
});

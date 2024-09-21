import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { get_encoding } from 'tiktoken'; // Corrected import for get_encoding from tiktoken

// Directory paths
const srcDir = './src'; // Directory with your source code
const rootDir = '.';    // Root directory

const outputFile = './scripts/output/stitched_code.md'; // Output file for Markdown

// GPT-4 encoding for token counting (you can change this to other models if needed)
const encoding = get_encoding('cl100k_base');

// Default root directory files to include
const defaultRootFiles = [
    'package.json',
    'index.html',
    'README.md',
    'eslint.config.js',
    'postcss.config.js',
    'prettier.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts'
];

// Function to get root files based on defaults or an include file
const getRootFiles = () => {
    const includeFile = '.include-stitch'; // Optional file to specify additional files

    let rootFiles = defaultRootFiles;

    // Check if include file exists and append custom files to the defaultRootFiles if present
    if (existsSync(includeFile)) {
        const customFiles = readFileSync(includeFile, 'utf-8').split('\n').map(f => f.trim()).filter(f => f);
        rootFiles = [...new Set([...defaultRootFiles, ...customFiles])]; // Merge defaults and custom files
    }

    return rootFiles.filter(file => existsSync(join(rootDir, file))); // Only return files that exist
};

// Function to recursively gather all .ts, .tsx, .js, .css, .json, and .md files,
// writing files before moving into subfolders
const getAllFiles = (dir, filesList = []) => {
    const files = readdirSync(dir);

    // Separate directories and files
    const directories = [];
    const currentFiles = [];

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            directories.push(filePath);  // Collect directories to process later
        } else if (['.ts', '.tsx', '.js', '.css', '.json', '.md'].some(ext => file.endsWith(ext))) {
            currentFiles.push(filePath);  // Collect current directory's files
        }
    });

    // Process current directory files first
    filesList.push(...currentFiles);

    // Recursively process directories
    directories.forEach(directory => {
        getAllFiles(directory, filesList);
    });

    return filesList;
};

// Function to handle Markdown file content differently by escaping triple backticks
const handleMarkdownContent = (content) => {
    const comment = '<!-- Note: Triple backticks replaced with "<!-- code block -->" to avoid conflicts -->\n';
    return comment + content.replace(/```/g, '<!-- code block -->');  // Replace triple backticks with alternate formatting
};

// Function to stitch files together into one Markdown file with code blocks
const stitchFiles = (files) => {
    let stitchedContent = '';
    let totalTokens = 0;

    files.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const fileExtension = file.split('.').pop();
        let processedContent = content;

        // Handle markdown files separately to avoid conflicts with backticks
        if (fileExtension === 'md') {
            processedContent = handleMarkdownContent(content);
        }

        // Append file content with Markdown code blocks for better readability
        stitchedContent += `\n\n## File: ${file}\n\n\`\`\`${fileExtension}\n${processedContent}\n\`\`\`\n`;

        // Estimate token count for the current file using Tiktoken
        const tokens = encoding.encode(processedContent);
        totalTokens += tokens.length;
    });

    // Write the stitched content to a markdown file
    writeFileSync(outputFile, stitchedContent);
    console.log(`Stitched code written to: ${outputFile}`);
    console.log(`Total estimated token count: ${totalTokens}`);
};

// Main execution
const rootFiles = getRootFiles().map(file => join(rootDir, file));
const sourceFiles = getAllFiles(srcDir);

stitchFiles([...rootFiles, ...sourceFiles]);

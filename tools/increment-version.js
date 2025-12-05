#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

function getLastCommitMessage(provided) {
  if (provided) return provided;
  try {
    return execSync('git log -1 --pretty=%B').toString().trim();
  } catch (e) {
    return '';
  }
}

function getLastVersionFromGit() {
  try {
    // Get the latest tag (version)
    const tag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"').toString().trim();
    return tag.replace(/^v/, '');
  } catch (e) {
    return '0.0.0';
  }
}

function bumpVersion(current, level) {
  const parts = current.split('.').map(n => parseInt(n, 10));
  while (parts.length < 3) parts.push(0);
  if (level === 'major') { 
    parts[0] += 1; 
    // Keep MINOR and PATCH (don't reset anything)
  }
  else if (level === 'minor') { parts[1] += 1; parts[2] = 0; }
  else { parts[2] += 1; }
  return parts.join('.');
}

function main() {
  const providedMsg = process.argv.slice(2).join(' ');
  const msg = getLastCommitMessage(providedMsg);
  let level = 'patch';
  if (/BREAKING CHANGE/.test(msg) || /BREAKING-CHANGE/.test(msg)) level = 'major';
  else if (/^feat(\(|:)/i.test(msg) || /^feat/i.test(msg)) level = 'minor';
  else if (/^fix(\(|:)/i.test(msg) || /^fix/i.test(msg)) level = 'patch';

  // Obter a versão da última tag do git em vez do package.json
  const current = getLastVersionFromGit();
  const next = bumpVersion(current, level);
  
 // Atualizar package.json
  const pj = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pj.version = next;
  fs.writeFileSync('package.json', JSON.stringify(pj, null, 2) + '\n');
  
// Imprima a nova versão de forma que seja facilmente analisada pelo GH Actions
  console.log(`NEW_VERSION=${next}`);
// Imprima também em formato legível
  console.log(next);
}

main();

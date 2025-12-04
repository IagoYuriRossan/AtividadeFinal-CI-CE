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

function bumpVersion(current, level) {
  const parts = current.split('.').map(n => parseInt(n, 10));
  while (parts.length < 3) parts.push(0);
  if (level === 'major') { parts[0] += 1; parts[1] = 0; parts[2] = 0; }
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

  const pj = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const current = pj.version || '0.0.0';
  const next = bumpVersion(current, level);
  pj.version = next;
  fs.writeFileSync('package.json', JSON.stringify(pj, null, 2) + '\n');
  // Print the new version in a way easily parsed by GH Actions
  console.log(`NEW_VERSION=${next}`);
  // Also print plainly
  console.log(next);
}

main();

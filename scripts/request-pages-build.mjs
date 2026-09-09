import { execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN;
if (!repository || !token)
  throw new Error('Run this script in the deployment workflow.');
const commit = execFileSync('git', ['-C', 'work/pages', 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const endpoint = `https://api.github.com/repos/${repository}/pages/builds`;
async function request(url, method = 'GET') {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok)
    throw new Error(`GitHub Pages returned HTTP ${response.status}.`);
  return response.json();
}
// GITHUB_TOKEN pushes do not automatically trigger legacy Pages builds.
await request(endpoint, 'POST');
for (let attempt = 0; attempt < 60; attempt++) {
  const build = await request(`${endpoint}/latest`);
  if (build.commit === commit) {
    if (build.status === 'built') {
      console.log(`GitHub Pages successfully published ${commit}.`);
      process.exit(0);
    }
    if (build.status === 'errored')
      throw new Error(build.error?.message || 'GitHub Pages build failed.');
  }
  await setTimeout(5000);
}
throw new Error('Timed out waiting for the new GitHub Pages build.');

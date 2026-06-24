<?php
$secret = 'digisyn2026';
$provided = $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? $_GET['secret'] ?? '';

if ($provided !== $secret) {
    http_response_code(403);
    die('Forbidden');
}

$repo = '/home/digisync/public_html';
$commands = [
    "cd {$repo}",
    "git fetch origin --prune",
    "git reset --hard origin/main",
    "git clean -fd",
];

$output = shell_exec(implode(' && ', $commands) . ' 2>&1');
echo "Deploy complete:\n" . $output;

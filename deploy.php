<?php
$secret = 'digisyn2026';
$provided = $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? $_GET['secret'] ?? '';

if ($provided !== $secret) {
    http_response_code(403);
    die('Forbidden');
}

$output = shell_exec('cd /home/digisync/digisyn.co && git fetch origin && git reset --hard origin/main 2>&1');
echo "Deploy complete:\n" . $output;

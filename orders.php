<?php
declare(strict_types=1);
require __DIR__ . '/_utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$dbFile = __DIR__ . '/../data/orders.json';
$orders = read_json($dbFile, []);

if ($method === 'GET') {
    
    $list = array_values(array_reverse($orders));
    send_json([ 'orders' => $list ]);
}

if ($method === 'POST') {
    $payload = get_json_input();

    
    $customer = $payload['customer'] ?? [];
    $items = $payload['items'] ?? [];
    $totals = $payload['totals'] ?? [];

    if (!$customer || !$items) {
        send_json([ 'error' => 'Missing customer or items' ], 422);
    }

    $now = (new DateTimeImmutable('now', new DateTimeZone('Asia/Manila')))->format(DateTimeInterface::RFC3339);
    $order = [
        'id' => uniqid('ord_', true),
        'createdAt' => $now,
        'status' => 'new',
        'customer' => [
            'name' => trim((string)($customer['name'] ?? '')),
            'phone' => trim((string)($customer['phone'] ?? '')),
            'address' => trim((string)($customer['address'] ?? '')),
            'type' => (string)($customer['type'] ?? 'pickup')
        ],
        'items' => $items,
        'totals' => [
            'subtotal' => (float)($totals['subtotal'] ?? 0),
            'discount' => (float)($totals['discount'] ?? 0),
            'payable' => (float)($totals['payable'] ?? 0)
        ]
    ];

    $orders[] = $order;
    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to save order' ], 500);
    }

    send_json([ 'ok' => true, 'order' => $order ]);
}

if ($method === 'PATCH' || $method === 'PUT') {
    $payload = get_json_input();
    $id = (string)($payload['id'] ?? '');
    if (!$id) send_json([ 'error' => 'Missing id' ], 400);
    $found = false;
    foreach ($orders as &$o) {
        if (($o['id'] ?? '') === $id) {
            if (isset($payload['status'])) $o['status'] = (string)$payload['status'];
            if (isset($payload['customer'])) $o['customer'] = (array)$payload['customer'];
            if (isset($payload['items'])) $o['items'] = (array)$payload['items'];
            if (isset($payload['totals'])) $o['totals'] = (array)$payload['totals'];
            $found = true; break;
        }
    }
    unset($o);
    if (!$found) send_json([ 'error' => 'Order not found' ], 404);
    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to update order' ], 500);
    }
    send_json([ 'ok' => true ]);
}

send_json([ 'error' => 'Method not allowed' ], 405);
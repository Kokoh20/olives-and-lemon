<?php
declare(strict_types=1);
require __DIR__ . '/util.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Store orders JSON within the repository directory
$dbFile = __DIR__ . '/data/orders.json';
$orders = read_json($dbFile, []);

if ($method === 'GET') {
    // Return newest first
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

if ($method === 'PUT' || $method === 'PATCH') {
    $payload = get_json_input();
    $id = $_GET['id'] ?? ($payload['id'] ?? '');
    if (!$id) {
        send_json([ 'error' => 'Missing order id' ], 400);
    }

    $found = false;
    foreach ($orders as &$ord) {
        if (($ord['id'] ?? '') === $id) {
            // Allow updating limited fields for safety
            if (isset($payload['status'])) {
                $ord['status'] = (string)$payload['status'];
            }
            if (isset($payload['customer']) && is_array($payload['customer'])) {
                $ord['customer'] = array_merge($ord['customer'] ?? [], $payload['customer']);
            }
            if (isset($payload['totals']) && is_array($payload['totals'])) {
                $ord['totals'] = array_merge($ord['totals'] ?? [], $payload['totals']);
            }
            $found = true;
            break;
        }
    }
    unset($ord);

    if (!$found) {
        send_json([ 'error' => 'Order not found' ], 404);
    }
    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to update order' ], 500);
    }
    send_json([ 'ok' => true, 'order' => $orders[array_key_last($orders)] ]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        send_json([ 'error' => 'Missing order id' ], 400);
    }

    $before = count($orders);
    $orders = array_values(array_filter($orders, fn($o) => ($o['id'] ?? '') !== $id));
    if ($before === count($orders)) {
        send_json([ 'error' => 'Order not found' ], 404);
    }
    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to delete order' ], 500);
    }
    send_json([ 'ok' => true ]);
}

send_json([ 'error' => 'Method not allowed' ], 405);

<?php
declare(strict_types=1);

// Use shared JSON helpers
require __DIR__ . '/util.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Store data inside the project under data/orders.json
$dbFile = __DIR__ . '/data/orders.json';
$orders = read_json($dbFile, []);

if ($method === 'GET') {
    // Optional: ?id=... returns a single order
    $id = $_GET['id'] ?? null;
    if ($id) {
        foreach ($orders as $o) {
            if (($o['id'] ?? null) === $id) {
                send_json([ 'order' => $o ]);
            }
        }
        send_json([ 'error' => 'Order not found' ], 404);
    }

    $list = array_values(array_reverse($orders));
    send_json([ 'orders' => $list ]);
}

if ($method === 'POST') {
    $payload = get_json_input();

    // Expect: { customer: {...}, items: [...], totals: {...} }
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

if ($method === 'PATCH') {
    $payload = get_json_input();
    $id = (string)($payload['id'] ?? ($_GET['id'] ?? ''));
    if ($id === '') {
        send_json([ 'error' => 'Missing id' ], 422);
    }

    $updated = false;
    foreach ($orders as &$o) {
        if (($o['id'] ?? null) === $id) {
            // Allow updating status or customer info
            if (isset($payload['status'])) {
                $o['status'] = (string)$payload['status'];
            }
            if (isset($payload['customer']) && is_array($payload['customer'])) {
                $o['customer'] = array_merge($o['customer'] ?? [], $payload['customer']);
            }
            if (isset($payload['totals']) && is_array($payload['totals'])) {
                $o['totals'] = array_merge($o['totals'] ?? [], $payload['totals']);
            }
            $updated = true;
            break;
        }
    }
    unset($o);

    if (!$updated) {
        send_json([ 'error' => 'Order not found' ], 404);
    }

    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to save order' ], 500);
    }

    send_json([ 'ok' => true ]);
}

if ($method === 'DELETE') {
    $id = (string)($_GET['id'] ?? '');
    if ($id === '') {
        $payload = get_json_input();
        $id = (string)($payload['id'] ?? '');
    }
    if ($id === '') {
        send_json([ 'error' => 'Missing id' ], 422);
    }

    $before = count($orders);
    $orders = array_values(array_filter($orders, static fn($o) => ($o['id'] ?? null) !== $id));
    if ($before === count($orders)) {
        send_json([ 'error' => 'Order not found' ], 404);
    }
    if (!write_json_atomic($dbFile, $orders)) {
        send_json([ 'error' => 'Failed to save order' ], 500);
    }
    send_json([ 'ok' => true ]);
}

send_json([ 'error' => 'Method not allowed' ], 405);

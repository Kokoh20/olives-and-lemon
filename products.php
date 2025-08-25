<?php
declare(strict_types=1);
require __DIR__ . '/_utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$dbFile = __DIR__ . '/../data/products.json';
$products = read_json($dbFile, []);

if ($method === 'GET') {
    send_json([ 'products' => array_values($products) ]);
}

if ($method === 'POST') {
    $payload = get_json_input();
    $prod = [
        'id' => trim((string)($payload['id'] ?? uniqid('prod_', true))),
        'name' => trim((string)($payload['name'] ?? 'Untitled')),
        'price' => (float)($payload['price'] ?? 0),
        'category' => (string)($payload['category'] ?? 'misc'),
        'image' => (string)($payload['image'] ?? ''),
        'moods' => (array)($payload['moods'] ?? [])
    ];
    $products[$prod['id']] = $prod;
    if (!write_json_atomic($dbFile, $products)) {
        send_json([ 'error' => 'Failed to save product' ], 500);
    }
    send_json([ 'ok' => true, 'product' => $prod ]);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $payload = get_json_input();
    $id = (string)($payload['id'] ?? '');
    if (!$id || !isset($products[$id])) { send_json([ 'error' => 'Product not found' ], 404); }
    $prod = $products[$id];
    foreach (['name','price','category','image','moods'] as $key) {
        if (array_key_exists($key, $payload)) $prod[$key] = $payload[$key];
    }
    $products[$id] = $prod;
    if (!write_json_atomic($dbFile, $products)) {
        send_json([ 'error' => 'Failed to update product' ], 500);
    }
    send_json([ 'ok' => true, 'product' => $prod ]);
}

if ($method === 'DELETE') {
    $payload = get_json_input();
    $id = (string)($payload['id'] ?? '');
    if (!$id || !isset($products[$id])) { send_json([ 'error' => 'Product not found' ], 404); }
    unset($products[$id]);
    if (!write_json_atomic($dbFile, $products)) {
        send_json([ 'error' => 'Failed to delete product' ], 500);
    }
    send_json([ 'ok' => true ]);
}

send_json([ 'error' => 'Method not allowed' ], 405);

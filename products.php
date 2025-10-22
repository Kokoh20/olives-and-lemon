<?php
declare(strict_types=1);
require __DIR__ . '/util.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$dbFile = __DIR__ . '/data/products.json';

// Seed products on first run
$seed = [
    [ 'id' => 'macchiato', 'name' => 'Macchiato', 'price' => 99, 'category' => 'rice-bowl', 'image' => 'assets/images/coffee7.jpg' ],
    [ 'id' => 'chocolate-donuts', 'name' => 'Chocolate Donuts', 'price' => 99, 'category' => 'rice-bowl', 'image' => 'assets/images/dessert3.jpg' ],
    [ 'id' => 'salted-caramel', 'name' => 'Salted Caramel', 'price' => 88, 'category' => 'rice-bowl', 'image' => 'assets/images/drink1.jpg' ],
    [ 'id' => 'yema-cake', 'name' => 'Yema Cake', 'price' => 99, 'category' => 'rice-bowl', 'image' => 'assets/images/cake16.jpg' ],
    [ 'id' => 'latte', 'name' => 'Latte', 'price' => 99, 'category' => 'rice-bowl', 'image' => 'assets/images/coffee6.jpg' ],
    [ 'id' => 'mini-red-velvet-cake', 'name' => 'Mini Red Velvet Cake', 'price' => 99, 'category' => 'rice-bowl', 'image' => 'assets/images/cake11.jpg' ],
];

$products = read_json($dbFile, $seed);
if (!file_exists($dbFile)) {
    // Persist seed on first access
    @write_json_atomic($dbFile, $products);
}

if ($method === 'GET') {
    send_json([ 'products' => array_values($products) ]);
}

if ($method === 'POST') {
    $payload = get_json_input();
    $id = trim((string)($payload['id'] ?? ''));
    $name = trim((string)($payload['name'] ?? ''));
    $price = (float)($payload['price'] ?? 0);
    $category = trim((string)($payload['category'] ?? 'uncategorized'));
    $image = trim((string)($payload['image'] ?? ''));
    if ($name === '' || $price <= 0) {
        send_json([ 'error' => 'Name and positive price required' ], 422);
    }
    if ($id === '') {
        $id = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
    }
    foreach ($products as $p) {
        if (($p['id'] ?? '') === $id) {
            send_json([ 'error' => 'Product id already exists' ], 409);
        }
    }
    $prod = [ 'id' => $id, 'name' => $name, 'price' => $price, 'category' => $category, 'image' => $image ];
    $products[] = $prod;
    if (!write_json_atomic($dbFile, $products)) {
        send_json([ 'error' => 'Failed to save product' ], 500);
    }
    send_json([ 'ok' => true, 'product' => $prod ]);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $payload = get_json_input();
    $id = $_GET['id'] ?? ($payload['id'] ?? '');
    if (!$id) { send_json([ 'error' => 'Missing product id' ], 400); }
    $found = false;
    foreach ($products as &$p) {
        if (($p['id'] ?? '') === $id) {
            if (isset($payload['name'])) { $p['name'] = trim((string)$payload['name']); }
            if (isset($payload['price'])) { $p['price'] = (float)$payload['price']; }
            if (isset($payload['category'])) { $p['category'] = trim((string)$payload['category']); }
            if (isset($payload['image'])) { $p['image'] = trim((string)$payload['image']); }
            $found = true;
            break;
        }
    }
    unset($p);
    if (!$found) { send_json([ 'error' => 'Product not found' ], 404); }
    if (!write_json_atomic($dbFile, $products)) { send_json([ 'error' => 'Failed to update product' ], 500); }
    send_json([ 'ok' => true ]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) { send_json([ 'error' => 'Missing product id' ], 400); }
    $before = count($products);
    $products = array_values(array_filter($products, fn($p) => ($p['id'] ?? '') !== $id));
    if ($before === count($products)) { send_json([ 'error' => 'Product not found' ], 404); }
    if (!write_json_atomic($dbFile, $products)) { send_json([ 'error' => 'Failed to delete product' ], 500); }
    send_json([ 'ok' => true ]);
}

send_json([ 'error' => 'Method not allowed' ], 405);


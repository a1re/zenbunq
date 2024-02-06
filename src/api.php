<?php

$DATA_FILE = [
  "accounts" => "../data/accounts.json",
  "counterparties" => "../data/counterparties.json",
  "categories" => "../data/categories.json",
];

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (!array_key_exists($_GET["data"], $DATA_FILE)) {
  http_response_code(406);
  echo "Data domain is not defined";
}

if ($_SERVER["REQUEST_METHOD"] === 'POST') {
  header("Access-Control-Allow-Methods: POST");

} elseif ($_SERVER["REQUEST_METHOD"] === 'PUT') {
  header("Access-Control-Allow-Methods: PUT");

} elseif ($_SERVER["REQUEST_METHOD"] === 'DELETE') {
  header("Access-Control-Allow-Methods: DELETE");

} else {
  header("Access-Control-Allow-Methods: GET");

  $counterparties = file_get_contents($DATA_FILE[$_GET["data"]]);
  $json_data = json_decode($counterparties, true);
  echo json_encode($json_data);
  die();
}


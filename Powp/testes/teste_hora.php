<?php
$data = date('Y-m-d H:i:s');

echo "Data: " . $data;
echo "<br> Fuso Horário atual: " . date_default_timezone_get();
?>